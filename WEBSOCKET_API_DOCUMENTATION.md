"""
Bedrock-powered multi-agent creative chain for WOW outputs.
- Python 3.10+
- FastAPI API: POST /generate
- Steps: intent -> trends -> ideation -> script -> critic -> package

Env vars required:
- AWS_REGION (e.g., ap-south-1)
- Optional: TRENDS_PROVIDER ("tavily"|"serper"|"newsapi"), and respective API keys
  - TAVILY_API_KEY
  - SERPER_API_KEY
  - NEWSAPI_API_KEY

IAM: bedrock:InvokeModel permission for the chosen model ID.
"""

import logging
import json
from typing import Any, Dict, Generator

from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware

from config import PORT
from models import GenerateRequest
from intent_classifier import classify_intent
# from examples_research import get_examples
from trends_research import get_trends
from ideation import ideate, select_idea, quick_ideate
from script_generator import generate_script
from critic import critique

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

@app.get("/")
def root():
    return {"message": "API is working", "status": "ok"}


def package_output(
    intent: Dict[str, Any],
    topic: str,
    quick_idea: Dict[str, Any],
    examples: list,
    trends: list,
    ideas: list,
    selection: Dict[str, Any],
    script_obj: Dict[str, Any],
    review: Dict[str, Any],
) -> Dict[str, Any]:
    """Package all the generated content into a structured response."""
    return {
        "chat":{
            "thinking": intent.get("rationale"),
            "clarifying_questions": intent.get("clarifying_questions", []),
            "topic": topic,
        },
        "detials":{
            "format": intent.get("format"),
            "critic": review,
        },
        "ideas":{
            "quick_idea": quick_idea,
            "ideas":ideas,
             "examples": examples,
            "trends": trends,
            "selection": selection,
            "deliverable": script_obj,
        }, 
    }


def generate_stream(req: GenerateRequest) -> Generator[str, None, None]:
    """Stream the full chain end-to-end with intermediate updates."""
    logging.info(f"Received request: {req.query}")
    topic = req.topic_hint or req.query
    logging.info(f"Processing topic: {topic}")

    # Yield initial status
    yield f"data: {json.dumps({'step': 'start', 'message': 'Starting content generation...', 'topic': topic})}\n\n"

    # 1) Intent
    logging.info("Step 1: Classifying intent...")
    yield f"data: {json.dumps({'step': 'intent', 'message': 'Classifying intent...', 'status': 'in_progress'})}\n\n"
    
    intent = classify_intent(req.query)
    logging.info(f"Intent classified: {intent}")
    fmt = req.preferred_format or intent.get("format")

    if not fmt:
        # Return early with clarifying questions
        logging.warning("No format determined, returning with clarifying questions.")
        packaged = {
            "summary": {
                "format": None,
                "rationale": intent.get("rationale"),
                "clarifying_questions": intent.get("clarifying_questions", []),
                "topic": topic,
            }
        }
        yield f"data: {json.dumps({'step': 'complete', 'message': 'Need clarification', 'result': packaged})}\n\n"
        return

    yield f"data: {json.dumps({'step': 'intent', 'message': f'Intent classified: {fmt}', 'status': 'complete', 'data': intent})}\n\n"
    logging.info(f"Determined format: {fmt}")

    # 2) Quick Idea Generation
    logging.info("Step 2: Generating quick idea...")
    yield f"data: {json.dumps({'step': 'quick_idea', 'message': 'Generating quick idea...', 'status': 'in_progress'})}\n\n"
    
    quick_idea = quick_ideate(fmt, topic, req.query)
    if not quick_idea:
        logging.warning("Quick idea generation failed, continuing with full flow.")
        quick_idea = {"angle": "Standard approach", "hook": "Let's explore this", "description": "Basic content approach"}
    
    logging.info(f"Quick idea generated: {quick_idea}")
    yield f"data: {json.dumps({'step': 'quick_idea', 'message': 'Quick idea ready!', 'status': 'complete', 'data': quick_idea})}\n\n"

    # 3) Examples
    # logging.info("Step 3: Researching examples...")
    # yield f"data: {json.dumps({'step': 'examples', 'message': 'Researching examples...', 'status': 'in_progress'})}\n\n"
    
    # examples = get_examples(topic, fmt)
    # logging.info(f"Found {len(examples)} examples.")
    # yield f"data: {json.dumps({'step': 'examples', 'message': f'Found {len(examples)} examples', 'status': 'complete', 'data': examples})}\n\n"
    examples = []

    # 4) Trends
    logging.info("Step 4: Researching trends...")
    yield f"data: {json.dumps({'step': 'trends', 'message': 'Researching trends...', 'status': 'in_progress'})}\n\n"
    
    trends = get_trends(f"{topic} social media hooks 2025")
    logging.info(f"Found {len(trends)} trends.")
    yield f"data: {json.dumps({'step': 'trends', 'message': f'Found {len(trends)} trends', 'status': 'complete', 'data': trends})}\n\n"

    # 5) Enhanced Ideation
    logging.info("Step 5: Enhancing ideas with research...")
    yield f"data: {json.dumps({'step': 'ideation', 'message': 'Enhancing ideas with research...', 'status': 'in_progress'})}\n\n"
    
    ideas = ideate(fmt, topic, examples, trends)
    if not ideas:
        logging.error("Enhanced ideation failed, using quick idea.")
        ideas = [quick_idea]
    
    logging.info(f"Generated {len(ideas)} enhanced ideas.")
    yield f"data: {json.dumps({'step': 'ideation', 'message': f'Generated {len(ideas)} enhanced ideas', 'status': 'complete', 'data': ideas})}\n\n"

    # 6) Selection
    logging.info("Step 6: Selecting best idea...")
    yield f"data: {json.dumps({'step': 'selection', 'message': 'Selecting best idea...', 'status': 'in_progress'})}\n\n"
    
    selection = select_idea(fmt, topic, ideas)
    if not selection or not selection.get("selected"):
        logging.error("Idea selection failed, no selected idea.")
        yield f"data: {json.dumps({'step': 'error', 'message': 'Idea selection failed', 'error': 'No selected idea'})}\n\n"
        return
    
    logging.info("Selection complete.")
    yield f"data: {json.dumps({'step': 'selection', 'message': 'Best idea selected', 'status': 'complete', 'data': selection})}\n\n"

    selected_angle = selection["selected"].get("angle")
    selected_hook = selection["selected"].get("hook")
    if not selected_angle or not selected_hook:
        logging.error("Selected idea missing angle or hook.")
        yield f"data: {json.dumps({'step': 'error', 'message': 'Selected idea missing angle or hook', 'error': 'Invalid selection'})}\n\n"
        return

    # 7) Script for selected idea
    logging.info("Step 7: Generating script...")
    yield f"data: {json.dumps({'step': 'script', 'message': 'Generating script...', 'status': 'in_progress'})}\n\n"
    
    if "ugc" in fmt.lower():
        script_obj = generate_script("ugc", selected_angle, selected_hook, topic)
    elif "static" in fmt.lower():
        script_obj = generate_script("static", selected_angle, selected_hook, topic)
    else:
        script_obj = generate_script(fmt, selected_angle, selected_hook, topic)
    
    logging.info("Script generated.")
    yield f"data: {json.dumps({'step': 'script', 'message': 'Script generated', 'status': 'complete', 'data': script_obj})}\n\n"

    # 8) Critic
    logging.info("Step 8: Critiquing script...")
    yield f"data: {json.dumps({'step': 'critique', 'message': 'Critiquing script...', 'status': 'in_progress'})}\n\n"
    
    review = critique(fmt, topic, script_obj)
    logging.info("Critique complete.")
    yield f"data: {json.dumps({'step': 'critique', 'message': 'Critique complete', 'status': 'complete', 'data': review})}\n\n"

    # 9) Package
    logging.info("Step 9: Packaging output...")
    yield f"data: {json.dumps({'step': 'packaging', 'message': 'Packaging final output...', 'status': 'in_progress'})}\n\n"
    
    out = package_output(
        intent,
        topic,
        quick_idea,
        examples,
        trends,
        ideas,
        selection,
        script_obj,
        review,
    )
    logging.info("Packaging complete. Returning response.")
    
    # Final result
    yield f"data: {json.dumps({'step': 'complete', 'message': 'Content generation complete!', 'result': out})}\n\n"


@app.post("/generate")
def generate(req: GenerateRequest):
    """Run the full chain end-to-end with streaming response."""
    return StreamingResponse(
        generate_stream(req),
        media_type="text/plain",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"}
    )


# Local dev helper
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT, reload=True)
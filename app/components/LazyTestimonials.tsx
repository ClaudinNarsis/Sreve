'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';

const LazyTestimonials = dynamic(() => Promise.resolve(() => {
  return (
    <section className="testimonial-section">
      <div className="container">
        <h2>Hear it from our Clients</h2>
        <div className="grid">
          <article className="card">
            <Image 
              src="/assets/p3.jpeg" 
              alt="Priya - Performance Marketer testimonial" 
              className="testimonial-avatar" 
              width={80} 
              height={80} 
              loading="lazy" 
              sizes="80px" 
            />
            <blockquote>"Honestly, it felt like having a junior creative who gets it. We plugged in our product link, and Sreve gave us 10 ad options that we could instantly launch. It's now a core part of our workflow."</blockquote>
            <cite>— Priya, Performance Marketer, Beauty Startup</cite>
          </article>
          <article className="card">
            <Image 
              src="/assets/p1.jpg" 
              alt="Arjun - Growth Lead testimonial" 
              className="testimonial-avatar" 
              width={80} 
              height={80} 
              loading="lazy" 
              sizes="80px" 
            />
            <blockquote>"I've tried countless AI ad tools, but Sreve is the first that actually feels like it understands our products. We launched ads in 15 minutes that outperformed our best manually designed creatives"</blockquote>
            <cite>— Arjun, Growth Lead, DTC Apparel Brand</cite>
          </article>
          <article className="card">
            <Image 
              src="/assets/p2.jpeg" 
              alt="Lisa - Agency Founder testimonial" 
              className="testimonial-avatar" 
              width={80} 
              height={80} 
              loading="lazy" 
              sizes="80px" 
            />
            <blockquote>"As an agency owner, kickoff phases used to drain hours. With Sreve, we generate scroll-stopping ad variations in minutes, letting our designers focus on strategy and storytelling."</blockquote>
            <cite>— Lisa, Founder</cite>
          </article>
        </div>
        <div className="trust-badge">
          <p className="trust-text">✅ Trusted by 500+ creatives</p>
        </div>
      </div>
    </section>
  );
}), {
  loading: () => (
    <section className="testimonial-section">
      <div className="container">
        <h2>Hear it from our Clients</h2>
        <div className="grid">
          {[1, 2, 3].map(i => (
            <article key={i} className="card">
              <div style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: '#f0f0f0',
                marginBottom: '1rem'
              }} />
              <div style={{
                height: '4rem',
                backgroundColor: '#f8f8f8',
                borderRadius: '4px',
                marginBottom: '1rem'
              }} />
              <div style={{
                height: '1rem',
                backgroundColor: '#f0f0f0',
                borderRadius: '4px',
                width: '60%'
              }} />
            </article>
          ))}
        </div>
      </div>
    </section>
  ),
  ssr: false
});

export default LazyTestimonials;
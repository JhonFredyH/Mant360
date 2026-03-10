import React, { useState } from "react";
import { testimonialData } from "../../data/testimonialData";
import TestimonialCard from "../../components/Card/TestimonialCard";
import "./Testimonial.css";

const TestimonialSlider = () => {
  const [current, setCurrent] = useState(0);
  const total = testimonialData.length;

  const prev = () => setCurrent((c) => (c - 1 + total) % total);
  const next = () => setCurrent((c) => (c + 1) % total);
  const goTo = (i) => setCurrent(i);

  return (
    <div className="testimonial" id="testimonial">    
      <div className="title-block">        
        <h1>What Our <span>Clients Say</span></h1>
        <p className="subtitle">
          Real results from real partners. Here's what they experienced.
        </p>
      </div>      
      <div className="testimonial-slider">
        <button className="slider-arrow prev" onClick={prev} aria-label="Previous">
          ‹
        </button>

        <div className="slider-track">
          <div
            className="slider-inner"
            style={{ transform: `translateX(-${current * 100}%)` }}
          >
            {testimonialData.map((item) => (
              <TestimonialCard
                key={item.id}
                name={item.name}
                role={item.role}
                avatar={item.avatar}
                testimonial={item.testimonial}
              />
            ))}
          </div>
        </div>

        <button className="slider-arrow next" onClick={next} aria-label="Next">
          ›
        </button>
      </div>

      {/* Dots */}
      <div className="slider-dots">
        {testimonialData.map((_, i) => (
          <button
            key={i}
            className={`dot ${i === current ? "active" : ""}`}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Avatar */}
      <div className="testimonial-avatars">
        {testimonialData.map((item, i) => (
          <div
            key={item.id}
            className={`avatar-item ${i === current ? "active" : ""}`}
            onClick={() => goTo(i)}
            role="button"
            tabIndex={0}
            aria-label={`View testimonial from ${item.name}`}
            onKeyDown={(e) => e.key === "Enter" && goTo(i)}
          >
            <img src={item.avatar} alt={item.name} />
            <span className="avatar-name">{item.name.split(" ")[0]}</span>
            <span className="avatar-indicator" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestimonialSlider;

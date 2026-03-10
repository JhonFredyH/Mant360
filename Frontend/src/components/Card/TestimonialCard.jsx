
import "./TestimonialCard.css";

const TestimonialCard = ({ name, role, avatar, testimonial }) => {
  return (
    <div className="testimonial-card">
      <span className="quote-icon">"</span>

      <div className="testimonial-header">
        <img src={avatar} alt={name} className="testimonial-avatar" />
        <div>
          <p className="testimonial-name">{name}</p>
          <p className="testimonial-role">{role}</p>
        </div>
      </div>

      <p className="testimonial-text">{testimonial}</p>
    </div>
  );
};

export default TestimonialCard;

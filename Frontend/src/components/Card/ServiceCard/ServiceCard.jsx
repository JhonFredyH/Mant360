import "./ServiceCard.css";


const ServiceCard = ({ icon, title, value}) => {
  return (
    <div className="service-card">
      <span className="material-symbols-outlined">{icon}</span>
      <p>{title}</p>
      <h3 className="value">{value}</h3>
    </div>
  );
};

export default ServiceCard;
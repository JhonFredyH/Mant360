import "./IndustrialCard.css";

const IndustrialCard = ({ icon, title, description }) => {
  return (
     <div className="industrial-card">
      <div className="title">
        <span className="material-symbols-outlined">{icon}</span>
      <h3>{title}</h3>
      </div>      
      <h4 className="subtitle">{description}</h4>
    </div>
  )
}

export default IndustrialCard

import "./ProjectCard.css";

export default function ProjectCard({ project }) {
  return (
    <div className="project-card">
      <div className="image-wrapper">
        <img src={project.image} alt={project.title} />

        <span
          className="category"
          style={{ background: project.accent }}
        >
          {project.category}
        </span>
      </div>

      <div className="card-content">
        <h3>{project.title}</h3>
        <p>{project.description}</p>
      </div>
    </div>
  );
}
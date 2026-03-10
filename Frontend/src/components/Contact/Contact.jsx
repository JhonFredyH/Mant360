import "./Contact.css";

const Contact = () => {
  return (
    <section className="contact" id="contact">
      <div className="container-info">
        <h1>Let's Build the Future</h1>
        <p>
          Ready to discuss next technical project? Our engineers are available
          for consultation and on-site assessments.
        </p>
        <div className="info">
          <div className="info-item">
            <span className="material-symbols-outlined icon">location_on</span>
            <div className="info-text">
              <h4>Headquarters</h4>
              <p>1200 Industrial Drive, Sheffield, UK</p>
            </div>
          </div>
          <div className="info-item">
            <span className="material-symbols-outlined icon">
              stacked_email
            </span>
            <div className="info-text">
              <h4>Email Us</h4>
              <p>engineering@metaltech.com</p>
            </div>
          </div>
          <div className="info-item">
            <span className="material-symbols-outlined icon">
              support_agent
            </span>
            <div className="info-text">
              <h4>Support</h4>
              <p>24/7 Customer Support</p>
            </div>
          </div>
        </div>
      </div>
      <div className="container-form">
        <form action="" method="post" className="form">
          <div className="group">
            <div className="group-item">
              <label htmlFor="name">Full name</label>
              <input type="text" name="name" id="name" placeholder="John Doe" />
            </div>
            <div className="group-item">
              <label htmlFor="email">Email address</label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="john@company.com"
              />
            </div>
          </div>         
          <div className="group-select">
            <label htmlFor="message">Message</label>
            <textarea
              placeholder="Describe your project requirements"
              name="message"
              id="message"
              cols="30"
              rows="9"
            ></textarea>
          </div>
          <div className="group-select">
            <label htmlFor="files">
              Blueprints / Technical Drawings  <span> (Optional) </span>
            </label>
            <div className="file-upload">
              <span className="material-symbols-outlined upload-icon">
                upload_file
              </span>
              <p className="upload-text">Click to upload or drag and drop</p>
              <p className="upload-subtext">PDF, DWG, or DXF (Max. 20MB)</p>
              <input type="file" id="files" name="files" />
            </div>
          </div>

          <div className="button">
            <button type="submit" className="btn">
              Submit
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Contact;

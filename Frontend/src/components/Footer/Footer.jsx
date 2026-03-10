import facebook from "../../assets/icons/facebook.png";
import whatsapp from "../../assets/icons/whatapp.png";
import youtube from "../../assets/icons/youtube.png";
import instagram from "../../assets/icons/instagram.png";

import CreativeWebDesign from "../CreativeWeb/CreativeWeb Design";
import "./Footer.css";

const Footer = () => {
  return (
    <div className="footer">
      <h1>
        Metal <span>Tech</span>
      </h1>
      <div className="social">
        <a href="">
          <img src={facebook} alt="Facebook" />
        </a>
        <a href="">
          <img src={whatsapp} alt="WhatsApp" />
        </a>
        <a href="">
          <img src={youtube} alt="YouTube" />
        </a>
        <a href="">
          <img src={instagram} alt="YouTube" />
        </a>
      </div>
      <div className="line"></div>
      <div className="design">
       <CreativeWebDesign />
      </div>
    </div>
  );
};

export default Footer;

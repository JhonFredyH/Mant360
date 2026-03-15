import "./Navbar.css";
import {NAVBAR_ITEMS } from "../../data/dataItems";

const Navbar = () => {
  return (
    <nav>
      <a href="">
        METAL <span>TECH</span>
      </a>

      <ul>
        {NAVBAR_ITEMS.map((item) => (
           <li key={item.id}>
            {item.isButton ? (
              <a href={item.href} className="nav-btn">
                {item.label}
              </a>
            ) : (
              <a href={item.href}>{item.label}</a>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Navbar;

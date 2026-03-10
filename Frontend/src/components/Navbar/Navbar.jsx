import "./Navbar.css";
import { NAV_ITEMS } from "../../data/navItems";

const Navbar = () => {
  return (
    <nav>
      <a href="">
        METAL <span>TECH</span>
      </a>

      <ul>
        {NAV_ITEMS.map((item) => (
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

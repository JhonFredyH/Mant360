import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, EffectCoverflow } from "swiper/modules";
import { useRef } from "react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-coverflow";

import "./Projects.css";
import { projects } from "../../data/projects";
import ProjectCard from "../Card/ProjectCard";

const Projects = () => {
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const swiperRef = useRef(null);

  return (
    <section className="projects" id="projects">
      <div className="projects-header">
        <div>
          <h1>Recent Projects</h1>
          <p>Delivering excellence across industries</p>
        </div>

        <div className="projects-arrows">
          <button ref={prevRef}>‹</button>
          <button ref={nextRef}>›</button>
        </div>
      </div>

      <Swiper
        modules={[Navigation, EffectCoverflow]}
        effect="coverflow"
        centeredSlides={true}
        grabCursor={true}
        loop={true}
        speed={800}
        coverflowEffect={{
          rotate: 0,
          stretch: 0,
          depth: 120,
          modifier: 2,
          slideShadows: false,
        }}
        
        onBeforeInit={(swiper) => {
          swiper.params.navigation.prevEl = prevRef.current;
          swiper.params.navigation.nextEl = nextRef.current;
        }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          swiper.navigation.init();
          swiper.navigation.update();
        }}
        breakpoints={{
          320: { slidesPerView: 1 },
          768: { slidesPerView: 1.6 },
          1200: { slidesPerView: 2.0 },
        }}
      >
        {projects.map((project) => (
          <SwiperSlide key={project.id}>
            <ProjectCard project={project} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default Projects;
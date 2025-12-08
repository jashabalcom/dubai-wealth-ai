import { motion } from "framer-motion";
import { Play, Clock, BarChart, Star } from "lucide-react";

const courses = [
  {
    title: "Dubai Real Estate 101",
    description: "Master the fundamentals of Dubai property investment, from market dynamics to legal frameworks.",
    lessons: 12,
    duration: "3h 45m",
    level: "Beginner",
    rating: 4.9,
    thumbnail: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80",
  },
  {
    title: "Off-Plan Investment Mastery",
    description: "Learn to identify, evaluate, and secure the best off-plan opportunities before the market.",
    lessons: 18,
    duration: "5h 20m",
    level: "Intermediate",
    rating: 4.8,
    thumbnail: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=600&q=80",
  },
  {
    title: "Airbnb & Short-Term Rentals",
    description: "Maximize returns with Dubai's booming short-term rental market and Airbnb strategies.",
    lessons: 10,
    duration: "2h 50m",
    level: "Intermediate",
    rating: 4.9,
    thumbnail: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80",
  },
  {
    title: "Golden Visa Pathways",
    description: "Navigate UAE's Golden Visa program and secure long-term residency through real estate.",
    lessons: 8,
    duration: "2h 15m",
    level: "Beginner",
    rating: 5.0,
    thumbnail: "https://images.unsplash.com/photo-1549294413-26f195200c16?w=600&q=80",
  },
];

export function AcademySection() {
  return (
    <section id="academy" className="section-padding bg-background relative overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-muted/30 to-transparent pointer-events-none" />

      <div className="container-luxury relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="text-xs uppercase tracking-[0.3em] text-primary font-sans mb-4 block">
            Dubai Real Estate Academy
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-foreground mb-6">
            Learn from the
            <br />
            <span className="text-gradient-gold">Best in the Industry</span>
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Comprehensive courses designed by Dubai real estate experts with decades of combined experience.
          </p>
        </motion.div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {courses.map((course, index) => (
            <motion.div
              key={course.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group cursor-pointer"
            >
              <div className="card-luxury p-0 overflow-hidden">
                {/* Thumbnail */}
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-secondary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center">
                      <Play className="w-6 h-6 text-primary-foreground ml-1" />
                    </div>
                  </div>
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-secondary/80 text-secondary-foreground text-xs font-sans uppercase tracking-wider">
                      {course.level}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-serif text-foreground mb-2 group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    {course.description}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4 text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <BarChart className="w-4 h-4" />
                        {course.lessons} lessons
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {course.duration}
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-primary">
                      <Star className="w-4 h-4 fill-current" />
                      {course.rating}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-12"
        >
          <a
            href="#membership"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-sans text-sm uppercase tracking-[0.1em]"
          >
            View All 50+ Courses
            <span className="text-lg">→</span>
          </a>
        </motion.div>
      </div>
    </section>
  );
}

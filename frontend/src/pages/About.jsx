import React from "react";

export default function About() {
    const testimonials = [
        {
            name: "Bonnie Green",
            title: "Developer at SERGENTX™",
            image: "https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/karen-nelson.png",
            headline: "Very easy this was to integrate",
            quote: "If you care for your time, I hands down would go with this."
        },
        {
            name: "Roberta Casas",
            title: "Lead designer at SERGENTX™",
            image: "https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/roberta-casas.png",
            headline: "Solid foundation for any project",
            quote: "Designing with Figma components that can be easily translated to the utility classes of Tailwind CSS is a huge timesaver!"
        },
        {
            name: "Jese Leos",
            title: "Software Engineer at SERGENTX™",
            image: "https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/jese-leos.png",
            headline: "Mindblowing workflow",
            quote: "Aesthetically, the well designed components are beautiful and will undoubtedly level up your next application."
        },
        {
            name: "Joseph McFall",
            title: "CTO at SERGENTX™",
            image: "https://flowbite.s3.amazonaws.com/blocks/marketing-ui/avatars/joseph-mcfall.png",
            headline: "Efficient Collaborating",
            quote: "You have many examples that can be used to create a fast prototype for your team."
        }
    ];

    return (
        <div>
            <div className="bg-center bg-[url('../components/bg/bg2.jpg')] bg-gray-700 bg-blend-multiply">
                <div className="px-4 mx-auto max-w-screen-2xl text-center py-24 lg:py-56">
                    <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl">Company Potential</h1>
                    <p className="mb-8 text-lg font-normal text-gray-300 lg:text-xl sm:px-16 lg:px-48">This online retail platform caters to civilians seeking high-quality military-grade clothing and equipment.</p>
                </div>
            </div>
            <div className="flex flex-col -mt-10 mx-10">
                <div className="card rounded-lg shadow-md bg-white p-10">
                    <div className="grid gap-4 border border-gray-200 rounded-lg shadow-sm md:grid-cols-2 dark:border-gray-700 dark:bg-gray-800">
                        {testimonials.map((item, index) => (
                            <figure key={index} className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-gray-800 dark:border-gray-700">
                                <blockquote className="max-w-2xl mx-auto text-gray-500 dark:text-gray-400">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.headline}</h3>
                                    <p className="my-4">{item.quote}</p>
                                </blockquote>
                                <figcaption className="flex items-center justify-center mt-4">
                                    <img className="rounded-full w-9 h-9" src={item.image} alt="profile" />
                                    <div className="ml-3 font-medium text-left dark:text-white">
                                        <div>{item.name}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{item.title}</div>
                                    </div>
                                </figcaption>
                            </figure>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

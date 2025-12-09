import React from "react";

export default function Services() {
  const products = [
    {
      id: "product1",
      name: "Product Type 1",
      price: "€10",
      details: "Product details for Product Type 1",
      features: ["40 units", "1 feature", "Fast delivery"],
    },
    {
      id: "product2",
      name: "Product Type 2",
      price: "€20",
      details: "The most popular choice. Product details for Product Type 2",
      features: ["120 units", "3 different features", "Fast delivery"],
      popular: true,
    },
    {
      id: "product3",
      name: "Product Type 3",
      price: "€50",
      details: "Product details for Product Type 3",
      features: ["240 units", "6 different features", "Fast delivery"],
    },
  ];

  return (
    <div className="pt-5 bg-gray-900 min-h-screen" id="pricing">
      <div className="mx-auto pb-20 mt-4 max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-base font-semibold leading-7 text-indigo-400">
            Pricing
          </h1>
          <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Whether it's just you, or your entire team - we've got you covered.
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-300">
          Choose the product that works best
        </p>
        <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {products.map((product) => (
            <div
              key={product.id}
              className={`rounded-3xl p-8 xl:p-10 ${
                product.popular
                  ? "bg-white/5 ring-2 ring-indigo-500"
                  : "ring-1 ring-white/10"
              }`}
            >
              <div className="flex items-baseline justify-between gap-x-4">
                <h2
                  id={product.id}
                  className="text-lg font-semibold leading-8 text-white"
                >
                  {product.name}
                </h2>
                {product.popular && (
                  <span className="bg-indigo-500 px-2.5 py-1 text-xs font-semibold leading-5 text-white rounded-full">
                    Most popular
                  </span>
                )}
              </div>
              <p className="mt-4 text-sm leading-6 text-gray-300">
                {product.details}
              </p>
              <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-white">
                  {product.price} / unit
                </span>
              </p>
              <a
                href="/order"
                aria-describedby={product.id}
                className="bg-indigo-500 text-white shadow-sm hover:bg-indigo-400 focus-visible:outline-indigo-500 mt-6 block rounded-md py-2 px-3 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                Order Now
              </a>
              <ul className="mt-8 space-y-3 text-sm leading-6 text-gray-300 xl:mt-10">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex gap-x-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                      className="h-6 w-5 flex-none text-white"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
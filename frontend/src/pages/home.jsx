import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../Styles/loader.css";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import bg1 from "../components/bg/bg1.jpg";
import bg2 from "../components/bg/bg2.jpg";
import bg3 from "../components/bg/bg3.jpg";

const productsPerPage = 8;

export default function Home() {
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Carousel images and content
  const carouselItems = [
    {
      image: bg1,
      alt: "Built for the Mission",
      title: "Built for the Mission",
      description: "Premium tactical gear for professionals",
      buttonText: "Shop Now",
    },
    {
      image: bg2,
      alt: "Ready for Anything",
      title: "Ready for Anything",
      description: "Equipment for every scenario",
      buttonText: "Explore",
    },
    {
      image: bg3,
      alt: "Gear Up Now",
      title: "Gear Up Now",
      description: "Limited time deals on select items",
      buttonText: "View Offers",
    },
  ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Changed from /api/new-products to /api/products
        const response = await fetch("http://localhost:3001/api/products");
        const data = await response.json();
        setProducts(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products: ", error);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleThumbnailClick = (index) => {
    setCurrentSlide(index);
  };

  const totalPages = Math.ceil(products.length / productsPerPage);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [carouselItems.length]);

  return (
    <div>
      {/* eBay-style Carousel */}
      <div className="ebay-style-carousel bg-gray-100 pb-8">
        <div className="container mx-auto">
          {/* Main carousel image */}
          <div
            className="relative overflow-hidden rounded-lg shadow-lg"
            style={{ height: "500px" }}
          >
            {carouselItems.map((item, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                <img
                  src={item.image}
                  alt={item.alt}
                  className="w-full h-full object-cover object-center"
                />

                {/* Text overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
                  <h2 className="text-3xl font-bold mb-2">{item.title}</h2>
                  <p className="text-xl mb-4">{item.description}</p>
                  <Link to="/products" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded">
                    {item.buttonText}
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation dots */}
          <div className="flex justify-center mt-4 space-x-2">
            {carouselItems.map((_, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={`w-3 h-3 rounded-full ${
                  index === currentSlide ? "bg-blue-600" : "bg-gray-400"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Featured Products Section */}
      <div className="card rounded-lg shadow-md mx-10 bg-white p-6 mt-8">
        <div className="flex flex-col mt-8 ">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                FEATURED PRODUCTS
              </h2>
              <Link
                to="/products"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                View all
              </Link>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="loader"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {currentProducts.map((product) => {
                    const hasDiscount = product.discount > 0;
                    const originalPrice = product.price;
                    const discountedPrice = hasDiscount
                      ? originalPrice * (1 - product.discount / 100)
                      : originalPrice;

                    return (
                      // Removed ?type=new-products from the link
                      <Link
                        key={product._id}
                        to={`/product/${product._id}`}
                        className="group"
                      >
                        <div className="relative">
                          <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-100 group-hover:opacity-90">
                            <img
                              src={product.imageSrc}
                              alt={product.imageAlt}
                              className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                            />
                          </div>
                          {hasDiscount && (
                            <div className="absolute top-2 right-2 bg-red-600 text-white font-bold py-1 px-2 rounded-full text-xs">
                              {product.discount}% OFF
                            </div>
                          )}
                        </div>
                        <h3 className="mt-4 text-sm font-medium text-gray-700">
                          {product.name}
                        </h3>
                        <div className="mt-1 flex items-center">
                          {hasDiscount ? (
                            <>
                              <span className="text-lg font-semibold text-red-600 mr-2">
                                ${discountedPrice.toFixed(2)}
                              </span>
                              <span className="text-sm text-gray-500 line-through">
                                ${originalPrice.toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span className="text-lg font-semibold text-gray-900">
                              ${originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* eBay-style pagination */}
                <div className="flex justify-center mt-10">
                  <nav
                    className="inline-flex rounded-md shadow"
                    aria-label="Pagination"
                  >
                    <button
                      className="relative inline-flex items-center px-4 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      disabled={currentPage === 1}
                      onClick={() => paginate(currentPage - 1)}
                    >
                      Previous
                    </button>

                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Show current page and up to 2 pages before and after
                      const pageNumberToShow =
                        totalPages <= 5
                          ? i + 1
                          : currentPage <= 3
                          ? i + 1
                          : currentPage >= totalPages - 2
                          ? totalPages - 4 + i
                          : currentPage - 2 + i;

                      return (
                        <button
                          key={pageNumberToShow}
                          onClick={() => paginate(pageNumberToShow)}
                          className={`relative inline-flex items-center px-4 py-2 border ${
                            pageNumberToShow === currentPage
                              ? "bg-blue-600 text-white border-blue-600 z-10"
                              : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                          } text-sm font-medium`}
                        >
                          {pageNumberToShow}
                        </button>
                      );
                    })}

                    <button
                      className="relative inline-flex items-center px-4 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      disabled={currentPage === totalPages}
                      onClick={() => paginate(currentPage + 1)}
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
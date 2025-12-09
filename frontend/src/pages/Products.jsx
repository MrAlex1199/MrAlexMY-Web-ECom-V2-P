import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../Styles/loader.css";
// import { products } from "../ProductsData/ProductsData.js";

const productsPerPage = 8;

export default function Products() {
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true); // Add loading state

  // Fetch products from the API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/products");
        const data = await response.json();
        setProducts(data);
        setLoading(false); // Set loading to false after products are fetched
      } catch (error) {
        console.error("Error fetching products: ", error);
        setLoading(false); // Set loading to false even if there's an error
      }
    };
    fetchProducts();
  }, []);

  // Calculate the indexes for the current page's products
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  // Set current page when a pagination button is clicked
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Generate pagination buttons based on total product pages
  const totalPages = Math.ceil(products.length / productsPerPage);

  return (
    <div>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center card rounded-lg shadow-md my-5 mx-10 bg-white p-5 mt-5">
        <div className="container mx-auto ">
          {/* Header */}
          <div className="text-center text-2xl p-10 font-bold">
            <p>ALL PRODUCTS</p>
          </div>
          {/* Loading Animation */}
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
  );
}


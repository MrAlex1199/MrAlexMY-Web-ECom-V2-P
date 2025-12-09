import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import "../Styles/loader.css";

const productsPerPage = 8;
// Add loading state

export default function ProductFilter() {
  const { category } = useParams(); // Get the category from the URL
  console.log("Category from URL:", category);

  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

    // Fetch products from the API
    useEffect(() => {
      const fetchProducts = async () => {
        try {
          const response = await fetch("http://localhost:3001/api/products");
          const data = await response.json();
          // console.log("Raw API data:", data); // Log raw data for inspection
          const filteredProducts = category
            ? data.filter(product => {
                const breadcrumbBase = product.breadcrumbs?.split('>')[0]?.trim().toLowerCase();
                // console.log("Comparing:", breadcrumbBase, "with", category.trim().toLowerCase());
                return breadcrumbBase === category.trim().toLowerCase();
              })
            : data;
          // console.log("Filtered products:", filteredProducts);
          setProducts(filteredProducts);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching products: ", error);
          setLoading(false);
        }
      };
      fetchProducts();
    }, [category]);
    

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
    const renderPaginationButtons = () =>
        Array.from({ length: totalPages }, (_, i) => (
            <li key={i}>
                <button
                    onClick={() => paginate(i + 1)}
                    className={`${
                        i + 1 === currentPage ? "text-gray-900" : "text-gray-500"
                    } inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium`}
                >
                    {i + 1}
                </button>
            </li>
        ));
        
  return (
    <div className="w-full min-h-screen bg-gray-100 flex items-center justify-center card rounded-lg shadow-md mt-1 mx-10 bg-white ">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24 lg:max-w-7xl lg:px-8">
       { /* HEADER */}
          <div className="text-center text-2xl p-10 font-bold">
            <p>{category.toUpperCase()} PRODUCTS</p>
          </div>

          {/* LOADING ANIMATION */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="loader"></div>
          </div>
        ) : (
          <>
            {/* Products Grid */}
            <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
              {currentProducts.map((product) => {
                // Calculate discounted price if discount exists
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
                    <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200 xl:aspect-h-8 xl:aspect-w-7">
                      <img
                        src={product.imageSrc}
                        alt={product.imageAlt}
                        className="h-full w-full object-cover object-center group-hover:opacity-75"
                      />
                    </div>
                    <h3 className="mt-4 text-sm text-gray-700">{product.name}</h3>
                    <div className="mt-1 text-lg font-medium text-gray-900">
                      {hasDiscount ? (
                        <>
                          <span className="line-through text-gray-500 mr-2">
                            ${originalPrice.toFixed(2)}
                          </span>
                          <span className="text-red-600">
                            ${discountedPrice.toFixed(2)}
                          </span>
                          <span className="text-sm text-gray-500 ml-2">
                            ({product.discount}% off)
                          </span>
                        </>
                      ) : (
                        <span>${originalPrice.toFixed(2)}</span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            <nav className="mt-8" aria-label="Pagination">
              <ul className="flex justify-center">{renderPaginationButtons()}</ul>
            </nav>
          </>
        )}
      </div>
    </div>
  );
}


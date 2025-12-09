import { useState, useEffect, useCallback, useMemo } from "react";
import { StarIcon } from "@heroicons/react/20/solid";
import { RadioGroup } from "@headlessui/react";
import { useParams, useLocation } from "react-router-dom";
import { X } from "lucide-react";

// Move static data outside component to prevent recreation on each render
const commentsData = [
  {
    id: 1,
    name: "John Doe",
    comment: "Great product! Highly recommend.",
    reviewImg: [
      "https://st4.depositphotos.com/14953852/24787/v/450/depositphotos_247872612-stock-illustration-no-image-available-icon-vector.jpg",
      "https://st4.depositphotos.com/14953852/24787/v/450/depositphotos_247872612-stock-illustration-no-image-available-icon-vector.jpg",
      "https://st4.depositphotos.com/14953852/24787/v/450/depositphotos_247872612-stock-illustration-no-image-available-icon-vector.jpg",
    ],
    date: "14:30UTC+7 - 2023-10-01",
  },
  {
    id: 2,
    name: "Jane Smith",
    comment: "Not what I expected, but still okay.",
    reviewImg: [
      "https://st4.depositphotos.com/14953852/24787/v/450/depositphotos_247872612-stock-illustration-no-image-available-icon-vector.jpg",
      "https://st4.depositphotos.com/14953852/24787/v/450/depositphotos_247872612-stock-illustration-no-image-available-icon-vector.jpg",
      "https://st4.depositphotos.com/14953852/24787/v/450/depositphotos_247872612-stock-illustration-no-image-available-icon-vector.jpg",
    ],
    date: "15:00UTC+7 - 2023-10-02",
  },
];

// Extract utility function outside component
function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

// Create reusable components for better organization and performance
const ImageGallery = ({ images, openModal }) => (
  <div className="mx-auto mt-6 max-w-2xl sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-3 lg:gap-x-8 lg:px-8">
    <div
      className="aspect-h-4 aspect-w-3 hidden overflow-hidden rounded-lg lg:block cursor-pointer"
      onClick={() => openModal(0)}
    >
      <img
        src={images[0].src}
        alt={images[0].alt}
        className="h-full w-full object-cover object-center hover:opacity-75 transition-opacity"
        loading="lazy"
      />
    </div>
    <div className="hidden lg:grid lg:grid-cols-1 lg:gap-y-8">
      <div
        className="aspect-h-2 aspect-w-3 overflow-hidden rounded-lg cursor-pointer"
        onClick={() => openModal(1)}
      >
        <img
          src={images[1].src}
          alt={images[1].alt}
          className="h-full w-full object-cover object-center hover:opacity-75 transition-opacity"
          loading="lazy"
        />
      </div>
      <div
        className="aspect-h-2 aspect-w-3 overflow-hidden rounded-lg cursor-pointer"
        onClick={() => openModal(2)}
      >
        <img
          src={images[2].src}
          alt={images[2].alt}
          className="h-full w-full object-cover object-center hover:opacity-75 transition-opacity"
          loading="lazy"
        />
      </div>
    </div>
    <div
      className="aspect-h-5 aspect-w-4 lg:aspect-h-4 lg:aspect-w-3 sm:overflow-hidden sm:rounded-lg cursor-pointer"
      onClick={() => openModal(3)}
    >
      <img
        src={images[3].src}
        alt={images[3].alt}
        className="h-full w-full object-cover object-center hover:opacity-75 transition-opacity"
        loading="lazy"
      />
    </div>
  </div>
);

const ImageModal = ({ selectedImage, closeModal, navigateImage, images }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
    <div className="relative max-w-4xl w-full">
      <button
        onClick={closeModal}
        className="absolute right-2 top-2 z-10 p-2 bg-white bg-opacity-25 rounded-full hover:bg-opacity-50 transition-all"
      >
        <X size={24} />
      </button>

      <div className="flex justify-between absolute inset-x-0 top-1/2 transform -translate-y-1/2">
        <button
          onClick={() => navigateImage(-1)}
          className="p-2 m-2 bg-white bg-opacity-25 rounded-full hover:bg-opacity-50 transition-all"
          aria-label="Previous image"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <button
          onClick={() => navigateImage(1)}
          className="p-2 m-2 bg-white bg-opacity-25 rounded-full hover:bg-opacity-50 transition-all"
          aria-label="Next image"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <div className="bg-white p-2 rounded-lg shadow-xl">
        <img
          src={images[selectedImage].src}
          alt={images[selectedImage].alt}
          className="max-h-screen object-contain mx-auto"
        />
      </div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full">
        {selectedImage + 1} / {images.length}
      </div>
    </div>
  </div>
);

const ProductInfo = ({ product, hasDiscount, originalPrice, discountedPrice }) => (
  <div className="lg:col-span-2 lg:border-r lg:border-gray-200 lg:pr-8">
    <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
      {product.name}
    </h1>
  </div>
);

const PriceDisplay = ({ hasDiscount, originalPrice, discountedPrice, discount }) => (
  <p className="text-3xl tracking-tight text-gray-900">
    {hasDiscount ? (
      <>
        <span className="line-through text-gray-500 mr-2">
          ${originalPrice.toFixed(2)}
        </span>
        <span className="text-red-600">
          ${discountedPrice.toFixed(2)}
        </span>
        <span className="text-sm text-gray-500 ml-2">
          ({discount}% off)
        </span>
      </>
    ) : (
      <span>${originalPrice.toFixed(2)}</span>
    )}
  </p>
);

const Reviews = ({ reviewsAvg, reviewsCount, reviewsHref }) => (
  <div className="mt-6">
    <h3 className="sr-only">Reviews</h3>
    <div className="flex items-center">
      <div className="flex items-center">
        {[0, 1, 2, 3, 4].map((rating) => (
          <StarIcon
            key={rating}
            className={classNames(
              reviewsAvg > rating
                ? "text-gray-900"
                : "text-gray-200",
              "h-5 w-5 flex-shrink-0"
            )}
            aria-hidden="true"
          />
        ))}
      </div>
      <p className="sr-only">{reviewsAvg} out of 5 stars</p>
      <a
        href={reviewsHref}
        className="ml-3 text-sm font-medium text-indigo-600 hover:text-indigo-500"
      >
        {reviewsCount} reviews
      </a>
    </div>
  </div>
);

const CommentsSection = ({ comments }) => (
  <div className="mt-10 lg:col-span-2 lg:col-start-1 lg:border-t lg:border-gray-200 lg:pt-6">
    <h3 className="text-lg font-medium text-gray-900">Comments</h3>
    <div className="mt-4 space-y-6">
      {comments.map((comment) => (
        <div
          key={comment.id}
          className="border-b border-gray-200 pb-4"
        >
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <img
                className="h-10 w-10 rounded-full"
                src="https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg"
                alt={comment.name}
                loading="lazy"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {comment.name}
              </p>
              <p className="text-xs text-gray-500">{comment.date}</p>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-600">
            {comment.comment}
          </p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {comment.reviewImg.map((imgSrc, index) => (
              <img
                key={index}
                src={imgSrc}
                alt={`Review ${index + 1}`}
                className="h-20 w-20 object-cover rounded-lg border"
                loading="lazy"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
    <div className="mt-4">
      <textarea
        rows={3}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        placeholder="Add a comment..."
      ></textarea>
      <button
        type="button"
        className="mt-2 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Submit
      </button>
    </div>
  </div>
);

export default function ProductsDetails({ userId }) {
  const { id } = useParams();
  const location = useLocation();
  
  // Move this to useMemo to prevent recalculation on each render
  const type = useMemo(() => {
    const queryParams = new URLSearchParams(location.search);
    return queryParams.get("type") || "product";
  }, [location.search]);

  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoize calculated values to prevent recalculation on each render
  const { hasDiscount, originalPrice, discountedPrice } = useMemo(() => {
    if (!product) return { hasDiscount: false, originalPrice: 0, discountedPrice: 0 };
    
    const hasDiscount = product.discount > 0;
    const originalPrice = product.price;
    const discountedPrice = hasDiscount
      ? originalPrice * (1 - product.discount / 100)
      : originalPrice;
      
    return { hasDiscount, originalPrice, discountedPrice };
  }, [product]);

  // Use useCallback for event handlers to prevent recreation on each render
  const openModal = useCallback((imageIndex) => {
    setSelectedImage(imageIndex);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedImage(null);
  }, []);

  const navigateImage = useCallback((direction) => {
    if (!product) return;
    
    setSelectedImage(prevImage => {
      return (prevImage + direction + product.images.length) % product.images.length;
    });
  }, [product]);

  // Memoize the API endpoint to prevent recalculation
  const apiEndpoint = useMemo(() => {
    return type === "new-products"
      ? `http://localhost:3001/api/new-products/${id}`
      : `http://localhost:3001/api/products/${id}`;
  }, [id, type]);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(apiEndpoint);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data) {
          setProduct(data);
          setSelectedColor(data.colors?.[0]?.name || "");
          setSelectedSize(data.sizes?.[0]?.name || "");
        } else {
          throw new Error("Product not found or data is null");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setError(error.message);
        setProduct(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProduct();
  }, [apiEndpoint]);

  const handleAddToBag = useCallback(async (event) => {
    event.preventDefault(); // Prevent form submission
    
    if (!product) return;
    
    try {
      const finalPrice = hasDiscount
        ? originalPrice * (1 - product.discount / 100)
        : originalPrice;

      const response = await fetch(
        "http://localhost:3001/save-selected-products",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            productName: product.name,
            productId: product._id,
            price: finalPrice.toString(),
            imageSrc: product.imageSrc,
            selectedColor,
            selectedSize,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      alert("Product added to bag successfully");
    } catch (error) {
      console.error("Error adding product to bag:", error);
      alert("Failed to add product to bag");
    }
  }, [product, userId, hasDiscount, originalPrice, selectedColor, selectedSize]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500">Error loading product: {error}</div>
      </div>
    );
  }

  // If no product is found
  if (!product) {
    return <div className="text-center p-8">Product not found</div>;
  }

  return (
    <div className="bg-white">
      <div className="pt-6">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb">
          <ol className="mx-auto flex max-w-2xl items-center space-x-2 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
            {product.breadcrumbs.split(" > ").map((breadcrumb, index, array) => (
              <li key={index}>
                <div className="flex items-center">
                  <button
                    type="button"
                    className="mr-2 text-sm font-medium text-gray-900"
                  >
                    {breadcrumb}
                  </button>
                  {index < array.length - 1 && (
                    <svg
                      width={16}
                      height={20}
                      viewBox="0 0 16 20"
                      fill="currentColor"
                      aria-hidden="true"
                      className="h-5 w-4 text-gray-300"
                    >
                      <path d="M5.697 4.34L8.98 16.532h1.327L7.025 4.341H5.697z" />
                    </svg>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </nav>

        <div className="relative">
          {/* Image gallery */}
          <ImageGallery images={product.images} openModal={openModal} />

          {/* Modal */}
          {selectedImage !== null && (
            <ImageModal 
              selectedImage={selectedImage}
              closeModal={closeModal}
              navigateImage={navigateImage}
              images={product.images}
            />
          )}
        </div>

        {/* Product info */}
        <div className="mx-auto max-w-2xl px-4 pb-16 pt-10 sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-3 lg:grid-rows-[auto,auto,1fr] lg:gap-x-8 lg:px-8 lg:pb-24 lg:pt-16">
          <ProductInfo 
            product={product} 
            hasDiscount={hasDiscount} 
            originalPrice={originalPrice} 
            discountedPrice={discountedPrice} 
          />

          {/* Options */}
          <div className="mt-4 lg:row-span-3 lg:mt-0">
            <h2 className="sr-only">Product information</h2>
            
            <PriceDisplay 
              hasDiscount={hasDiscount}
              originalPrice={originalPrice}
              discountedPrice={discountedPrice}
              discount={product.discount}
            />

            {/* Reviews */}
            <Reviews 
              reviewsAvg={product.reviewsAvg}
              reviewsCount={product.reviewsCount}
              reviewsHref={product.reviewsHref}
            />

            <form className="mt-10" onSubmit={handleAddToBag}>
              {/* Colors */}
              <div>
                <h3 className="text-sm font-medium text-gray-900">Color</h3>

                <RadioGroup
                  value={selectedColor}
                  onChange={setSelectedColor}
                  className="mt-4"
                >
                  <RadioGroup.Label className="sr-only">
                    Choose a color
                  </RadioGroup.Label>
                  <div className="flex items-center space-x-3">
                    {product.colors.map((color) => (
                      <RadioGroup.Option
                        key={color.name}
                        value={color}
                        className={({ active, checked }) =>
                          classNames(
                            color.selectedClass,
                            active && checked ? "ring ring-offset-1" : "",
                            !active && checked ? "ring-2" : "",
                            "relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 focus:outline-none"
                          )
                        }
                      >
                        <RadioGroup.Label as="span" className="sr-only">
                          {color.name}
                        </RadioGroup.Label>
                        <span
                          aria-hidden="true"
                          className={classNames(
                            color.class,
                            "h-8 w-8 rounded-full border border-black border-opacity-10"
                          )}
                        />
                      </RadioGroup.Option>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              {/* Sizes */}
              <div className="mt-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">Size</h3>
                  <a
                    href="/"
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Size guide
                  </a>
                </div>

                <RadioGroup
                  value={selectedSize}
                  onChange={setSelectedSize}
                  className="mt-4"
                >
                  <RadioGroup.Label className="sr-only">
                    Choose a size
                  </RadioGroup.Label>
                  <div className="grid grid-cols-4 gap-4 sm:grid-cols-8 lg:grid-cols-4">
                    {product.sizes.map((size) => (
                      <RadioGroup.Option
                        key={size.name}
                        value={size}
                        disabled={!size.inStock}
                        className={({ active }) =>
                          classNames(
                            size.inStock
                              ? "cursor-pointer bg-white text-gray-900 shadow-sm"
                              : "cursor-not-allowed bg-gray-50 text-gray-200",
                            active ? "ring-2 ring-indigo-500" : "",
                            "group relative flex items-center justify-center rounded-md border py-3 px-4 text-sm font-medium uppercase hover:bg-gray-50 focus:outline-none sm:flex-1 sm:py-6"
                          )
                        }
                      >
                        {({ active, checked }) => (
                          <>
                            <RadioGroup.Label as="span">
                              {size.name}
                            </RadioGroup.Label>
                            {size.inStock ? (
                              <span
                                className={classNames(
                                  active ? "border" : "border-2",
                                  checked
                                    ? "border-indigo-500"
                                    : "border-transparent",
                                  "pointer-events-none absolute -inset-px rounded-md"
                                )}
                                aria-hidden="true"
                              />
                            ) : (
                              <span
                                aria-hidden="true"
                                className="pointer-events-none absolute -inset-px rounded-md border-2 border-gray-200"
                              >
                                <svg
                                  className="absolute inset-0 h-full w-full stroke-2 text-gray-200"
                                  viewBox="0 0 100 100"
                                  preserveAspectRatio="none"
                                  stroke="currentColor"
                                >
                                  <line
                                    x1={0}
                                    y1={100}
                                    x2={100}
                                    y2={0}
                                    vectorEffect="non-scaling-stroke"
                                  />
                                </svg>
                              </span>
                            )}
                          </>
                        )}
                      </RadioGroup.Option>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <button
                onClick={handleAddToBag}
                type="submit"
                className="mt-10 flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3  text-white font-medium rounded-lg bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
              >
                Add to bag
              </button>
            </form>
          </div>

          {/* Description and details */}
          <div className="py-10 lg:col-span-2 lg:col-start-1 lg:border-r lg:border-gray-200 lg:pb-16 lg:pr-8 lg:pt-6">
            <div>
              <h3 className="sr-only">Description</h3>
              <div className="space-y-6">
                <p className="text-base text-gray-900">{product.description}</p>
              </div>
            </div>
            <div className="mt-10">
              <h3 className="text-sm font-medium text-gray-900">Highlights</h3>
              <div className="mt-4">
                <ul className="list-disc space-y-2 pl-4 text-sm">
                  {product.highlights.map((highlight) => (
                    <li key={highlight} className="text-gray-400">
                      <span className="text-gray-600">{highlight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-10">
              <h2 className="text-sm font-medium text-gray-900">Details</h2>
              <div className="mt-4 space-y-6">
                <p className="text-sm text-gray-600">{product.details}</p>
              </div>
            </div>
          </div>

          {/* Comments section */}
          {commentsData && commentsData.length > 0 ? (
            <CommentsSection comments={commentsData} />
          ) : (
            <div className="mt-10 lg:col-span-2 lg:col-start-1 lg:border-t lg:border-gray-200 lg:pt-6">
              <h3 className="text-sm font-medium text-gray-900">
                No comments yet
              </h3>
              <div className="mt-4">
                <textarea
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="Add a comment..."
                ></textarea>
                <button
                  type="button"
                  className="mt-2 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Submit
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
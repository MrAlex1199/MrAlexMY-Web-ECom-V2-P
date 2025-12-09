import { useState, useEffect } from "react";
import { StarIcon } from "@heroicons/react/20/solid";
import { RadioGroup } from "@headlessui/react";
import { useParams } from "react-router-dom";
import { X } from "lucide-react";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const CommentsSection = ({ comments, onAddComment, onDeleteComment, userData }) => {
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [ratingStar, setRating] = useState(0);

  // Image upload for comments is disabled temporarily.

  const handleSubmit = (e) => {
    e.preventDefault();
    // send empty array for images since upload is disabled
    onAddComment(commentText, [], ratingStar);
    setCommentText("");
    setIsAddingComment(false);
  };

  return (
    <div className="mt-10 lg:col-span-2 lg:col-start-1 lg:border-t lg:border-gray-200 lg:pt-6">
      <h3 className="text-lg font-medium text-gray-900">Comments</h3>
      <div className="mt-4 space-y-6">
        {comments && comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment._id} className="border-b border-gray-200 pb-4">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <img className="h-10 w-10 rounded-full" src="https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg" alt={comment.name} loading="lazy" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{comment.name}</p>
                  {comment.rating > 0 && (
                    <div className="flex items-center my-1">
                      {[0, 1, 2, 3, 4].map((star) => (
                        <StarIcon key={star} className={classNames(comment.rating > star ? "text-yellow-400" : "text-gray-300", "h-5 w-5 flex-shrink-0")} aria-hidden="true" />
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-gray-500">{new Date(comment.date).toLocaleString()}</p>
                </div>
                {userData && String(userData.userId) === String(comment.userId?._id || comment.userId) && (
                  <button
                    onClick={() => {
                      if (window.confirm("Are you sure you want to delete this comment?")) {
                        if (onDeleteComment) onDeleteComment(comment._id);
                      }
                    }}
                    className="ml-auto text-red-500 hover:text-red-700 text-xs border border-red-200 rounded px-2 py-1"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-600">{comment.comment}</p>
              {/* Review images hidden/disabled for now */}
            </div>
          ))
        ) : (
          <p className="text-gray-500">No comments yet. Be the first to comment!</p>
        )}
      </div>

      <div className="mt-8">
        {!isAddingComment ? (
          <div className="p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50" onClick={() => setIsAddingComment(true)}>
            <p className="text-gray-500">Click here to add a comment...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4"></div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your rating</label>
            <div className="flex items-center space-x-1 my-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" className="focus:outline-none" onClick={() => setRating(star)} tabIndex={0} aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}>
                  <StarIcon className={classNames(ratingStar >= star ? "text-yellow-400" : "text-gray-300", "h-6 w-6")} aria-hidden="true" />
                </button>
              ))}
            </div>
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Add a comment</label>
              <textarea id="comment" name="comment" rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="Write your comment here..." required value={commentText} onChange={(e) => setCommentText(e.target.value)}></textarea>
            </div>
            {/* Image upload disabled for comments */}
            <div className="mt-4 flex space-x-3">
              <button type="submit" className="mt-2 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-5 py-2 text-white font-medium">Submit</button>
              <button type="button" onClick={() => setIsAddingComment(false)} className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">Cancel</button>
            </div>
          </form>
        )}
      </div>

      {/* Comment image modal removed */}
    </div>
  );
};

const ImageGallery = ({ images, openModal }) => (
  <div className="mx-auto mt-6 max-w-2xl sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-3 lg:gap-x-8 lg:px-8">
    <div className="aspect-h-4 aspect-w-3 hidden overflow-hidden rounded-lg lg:block cursor-pointer" onClick={() => openModal(0)}>
      <img src={images[0].src} alt={images[0].alt} className="h-full w-full object-cover object-center hover:opacity-75 transition-opacity" loading="lazy" />
    </div>
    <div className="hidden lg:grid lg:grid-cols-1 lg:gap-y-8">
      <div className="aspect-h-2 aspect-w-3 overflow-hidden rounded-lg cursor-pointer" onClick={() => openModal(1)}>
        <img src={images[1].src} alt={images[1].alt} className="h-full w-full object-cover object-center hover:opacity-75 transition-opacity" loading="lazy" />
      </div>
      <div className="aspect-h-2 aspect-w-3 overflow-hidden rounded-lg cursor-pointer" onClick={() => openModal(2)}>
        <img src={images[2].src} alt={images[2].alt} className="h-full w-full object-cover object-center hover:opacity-75 transition-opacity" loading="lazy" />
      </div>
    </div>
    <div className="aspect-h-5 aspect-w-4 lg:aspect-h-4 lg:aspect-w-3 sm:overflow-hidden sm:rounded-lg cursor-pointer" onClick={() => openModal(3)}>
      <img src={images[3].src} alt={images[3].alt} className="h-full w-full object-cover object-center hover:opacity-75 transition-opacity" loading="lazy" />
    </div>
  </div>
);

const ImageModal = ({ selectedImage, closeModal, navigateImage, images }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4">
    <div className="relative max-w-4xl w-full">
      <button onClick={closeModal} className="absolute right-2 top-2 z-10 p-2 bg-white bg-opacity-25 rounded-full hover:bg-opacity-50 transition-all"><X size={24} /></button>
      <div className="flex justify-between absolute inset-x-0 top-1/2 transform -translate-y-1/2">
        <button onClick={() => navigateImage(-1)} className="p-2 m-2 bg-white bg-opacity-25 rounded-full hover:bg-opacity-50 transition-all" aria-label="Previous image"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
        <button onClick={() => navigateImage(1)} className="p-2 m-2 bg-white bg-opacity-25 rounded-full hover:bg-opacity-50 transition-all" aria-label="Next image"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
      </div>
      <div className="bg-white p-2 rounded-lg shadow-xl">
        <img src={images[selectedImage].src} alt={images[selectedImage].alt} className="max-h-screen object-contain mx-auto" />
      </div>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full">{selectedImage + 1} / {images.length}</div>
    </div>
  </div>
);

export default function ProductsDetails({ userId, userData }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddToBagPopup, setShowAddToBagPopup] = useState(false);

  const openModal = (imageIndex) => setSelectedImage(imageIndex);
  const closeModal = () => setSelectedImage(null);
  const navigateImage = (direction) => {
    if (!product || !product.images) return;
    const newIndex = (selectedImage + direction + product.images.length) % product.images.length;
    setSelectedImage(newIndex);
  };

  const fetchProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3001/api/products/${id}`);
      if (!response.ok) throw new Error(`Error fetching product: ${response.status}`);
      const data = await response.json();
      if (data) {
        setProduct(data);
        if (data.colors && data.colors.length > 0) setSelectedColor(data.colors[0].name);
        if (data.sizes && data.sizes.length > 0) setSelectedSize(data.sizes[0].name);
      } else {
        throw new Error("Product not found or data is null");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleAddToBag = async () => {
    if (!selectedColor || !selectedSize) {
        alert("Please select a color and size.");
        return;
    }
    try {
      const response = await fetch("http://localhost:3001/save-selected-products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          productId: product._id,
          selectedColor: selectedColor, // Now a string
          selectedSize: selectedSize,   // Now a string
          quantity: 1,
        }),
      });

      if (response.ok) {
        setShowAddToBagPopup(true);
        setTimeout(() => setShowAddToBagPopup(false), 2000);
      } else {
        const err = await response.json();
        console.error("Failed to add product to bag:", err.message);
        alert(`Failed to add product: ${err.message}`);
      }
    } catch (error) {
      console.error("Error adding product to bag:", error);
      alert("An error occurred while adding the product.");
    }
  };

  const handleAddComment = async (commentText, reviewImages, ratingStar) => {
    try {
      if (!userId) {
        alert("You must be logged in to comment.");
        return;
      }
      const response = await fetch(`http://localhost:3001/products/${id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          name: userData?.fname || "Anonymous",
          comment: commentText,
          reviewImg: reviewImages,
          rating: ratingStar,
        }),
      });

      if (!response.ok) throw new Error(`Server responded with status: ${response.status}`);
      await fetchProduct(); // Refresh comments
    } catch (error) {
      console.error("Error adding comment:", error);
      alert(`Failed to add comment: ${error.message}`);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/products/${id}/comments/${commentId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error(`Failed to delete comment: ${response.status}`);
      fetchProduct(); // Refresh comments
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-10">Error: {error}</div>;
  if (!product) return <div className="text-center py-10">Product not found</div>;

  const hasDiscount = product.discount > 0;
  const originalPrice = product.price;
  const discountedPrice = hasDiscount ? originalPrice * (1 - product.discount / 100) : originalPrice;

  return (
    <div className="bg-white">
      {showAddToBagPopup && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded shadow-lg">
          Product added to bag successfully!
        </div>
      )}
      <div className="pt-6">
        <nav aria-label="Breadcrumb">
          <ol className="mx-auto flex max-w-2xl items-center space-x-2 px-4 sm:px-6 lg:max-w-7xl lg:px-8">
            {product.breadcrumbs && product.breadcrumbs.split(" > ").map((breadcrumb, index) => (
              <li key={index}>
                <div className="flex items-center">
                  <button type="button" className="mr-2 text-sm font-medium text-gray-900">{breadcrumb}</button>
                  {index < product.breadcrumbs.split(" > ").length - 1 && (
                    <svg width={16} height={20} viewBox="0 0 16 20" fill="currentColor" aria-hidden="true" className="h-5 w-4 text-gray-300"><path d="M5.697 4.34L8.98 16.532h1.327L7.025 4.341H5.697z" /></svg>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </nav>

        <div className="relative">
          {product.images && product.images.length > 0 && <ImageGallery images={product.images} openModal={openModal} />}
          {selectedImage !== null && <ImageModal selectedImage={selectedImage} closeModal={closeModal} navigateImage={navigateImage} images={product.images} />}
        </div>

        <div className="mx-auto max-w-2xl px-4 pb-16 pt-10 sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-3 lg:grid-rows-[auto,auto,1fr] lg:gap-x-8 lg:px-8 lg:pb-24 lg:pt-16">
          <div className="lg:col-span-2 lg:border-r lg:border-gray-200 lg:pr-8">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{product.name}</h1>
          </div>

          <div className="mt-4 lg:row-span-3 lg:mt-0">
            <h2 className="sr-only">Product information</h2>
            <p className="text-3xl tracking-tight text-gray-900">
              {hasDiscount ? (
                <><span className="line-through text-gray-500 mr-2">${originalPrice.toFixed(2)}</span><span className="text-red-600">${discountedPrice.toFixed(2)}</span><span className="text-sm text-gray-500 ml-2">({product.discount}% off)</span></>
              ) : (
                <span>${originalPrice.toFixed(2)}</span>
              )}
            </p>

            <div className="mt-6">
              <h3 className="sr-only">Reviews</h3>
              <div className="flex items-center">
                <div className="flex items-center">
                  {(() => {
                    const ratings = (product.comments || []).map((c) => c.rating || 0).filter((r) => r > 0);
                    const avg = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
                    return [0, 1, 2, 3, 4].map((rating) => (
                      <StarIcon key={rating} className={classNames(avg > rating ? "text-gray-900" : "text-gray-200", "h-5 w-5 flex-shrink-0")} aria-hidden="true" />
                    ));
                  })()}
                </div>
                <p className="sr-only">{product.reviewsAvg} out of 5 stars</p>
                <a href="#reviews" className="ml-3 text-sm font-medium text-indigo-600 hover:text-indigo-500">{product.comments?.length || 0} reviews</a>
              </div>
            </div>

            <form className="mt-10">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Color</h3>
                <RadioGroup value={selectedColor} onChange={setSelectedColor} className="mt-4">
                  <RadioGroup.Label className="sr-only">Choose a color</RadioGroup.Label>
                  <div className="flex items-center space-x-3">
                    {product.colors.map((color) => (
                      <RadioGroup.Option key={color.name} value={color.name} className={({ active, checked }) => classNames(color.selectedClass, active && checked ? "ring ring-offset-1" : "", !active && checked ? "ring-2" : "", "relative -m-0.5 flex cursor-pointer items-center justify-center rounded-full p-0.5 focus:outline-none")}>
                        <RadioGroup.Label as="span" className="sr-only">{color.name}</RadioGroup.Label>
                        <span aria-hidden="true" className={classNames(color.class, "h-8 w-8 rounded-full border border-black border-opacity-10")} />
                      </RadioGroup.Option>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <div className="mt-10">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-900">Size</h3>
                  <a href="/" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Size guide</a>
                </div>
                <RadioGroup value={selectedSize} onChange={setSelectedSize} className="mt-4">
                  <RadioGroup.Label className="sr-only">Choose a size</RadioGroup.Label>
                  <div className="grid grid-cols-4 gap-4 sm:grid-cols-8 lg:grid-cols-4">
                    {product.sizes.map((size) => (
                      <RadioGroup.Option key={size.name} value={size.name} disabled={!size.inStock} className={({ active }) => classNames(size.inStock ? "cursor-pointer bg-white text-gray-900 shadow-sm" : "cursor-not-allowed bg-gray-50 text-gray-200", active ? "ring-2 ring-indigo-500" : "", "group relative flex items-center justify-center rounded-md border py-3 px-4 text-sm font-medium uppercase hover:bg-gray-50 focus:outline-none sm:flex-1 sm:py-6")}>
                        {({ active, checked }) => (
                          <>
                            <RadioGroup.Label as="span">{size.name}</RadioGroup.Label>
                            {size.inStock ? (
                              <span className={classNames(active ? "border" : "border-2", checked ? "border-indigo-500" : "border-transparent", "pointer-events-none absolute -inset-px rounded-md")} aria-hidden="true" />
                            ) : (
                              <span aria-hidden="true" className="pointer-events-none absolute -inset-px rounded-md border-2 border-gray-200"><svg className="absolute inset-0 h-full w-full stroke-2 text-gray-200" viewBox="0 0 100 100" preserveAspectRatio="none" stroke="currentColor"><line x1={0} y1={100} x2={100} y2={0} vectorEffect="non-scaling-stroke" /></svg></span>
                            )}
                          </>
                        )}
                      </RadioGroup.Option>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <button onClick={handleAddToBag} type="button" className="mt-10 flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">Add to bag</button>
            </form>
          </div>

          <div className="py-10 lg:col-span-2 lg:col-start-1 lg:border-r lg:border-gray-200 lg:pb-16 lg:pr-8 lg:pt-6">
            <div>
              <h3 className="sr-only">Description</h3>
              <div className="space-y-6"><p className="text-base text-gray-900">{product.description}</p></div>
            </div>
            <div className="mt-10">
              <h3 className="text-sm font-medium text-gray-900">Highlights</h3>
              <div className="mt-4"><ul className="list-disc space-y-2 pl-4 text-sm">{product.highlights.map((highlight) => (<li key={highlight} className="text-gray-400"><span className="text-gray-600">{highlight}</span></li>))}</ul></div>
            </div>
            <div className="mt-10">
              <h2 className="text-sm font-medium text-gray-900">Details</h2>
              <div className="mt-4 space-y-6"><p className="text-sm text-gray-600">{product.details}</p></div>
            </div>
            <CommentsSection comments={product.comments || []} onAddComment={handleAddComment} onDeleteComment={handleDeleteComment} userData={userData} />
          </div>
        </div>
      </div>
    </div>
  );
}
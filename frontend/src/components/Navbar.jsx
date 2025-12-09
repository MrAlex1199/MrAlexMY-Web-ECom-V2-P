import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react"; // ลบ Popover, Tab ออก
import {
  Bars3Icon,
  ShoppingBagIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import logo from "./logo/weblogo.jpg";

const navigation = {
  // ปรับปรุงเพื่อให้แสดงหมวดหมู่หลักแบบเรียบง่าย
  categories: [
    { id: "men", name: "Men", href: "/products/men" },
    { id: "women", name: "Women", href: "/products/women" },
  ],
  pages: [
    { name: "Stores", href: "/Products" },
  ],
};


export default function Navbar({
  isLoggedIn,
  userData,
  selectedProducts,
  setDropdownOpen,
  dropdownOpen,
}) {
  const [open, setOpen] = useState(false);
  const profileImage =
    "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg";

  const handleLogout = () => {
    localStorage.removeItem("token");
  };

  return (
    <div className="bg-white">
      {/* Mobile menu */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 z-50 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex w-full max-w-xs flex-col overflow-y-auto bg-white pb-12 shadow-xl z-50">
                <div className="flex px-4 pb-2 pt-5">
                  <button
                    type="button"
                    className="relative -m-2 inline-flex items-center justify-center rounded-md p-2 text-gray-400"
                    onClick={() => setOpen(false)}
                  >
                    <span className="absolute -inset-0.5" />
                    <span className="sr-only">Close menu</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                {/* Mobile Links - ใช้ลิงก์ธรรมดาแทน Tab.Group */}
                <div className="space-y-6 border-t border-gray-200 px-4 py-6">
                  {navigation.categories.map((item) => (
                    <div key={item.name} className="flow-root">
                      <a
                        href={item.href}
                        className="-m-2 block p-2 font-medium text-gray-900"
                      >
                        {item.name}
                      </a>
                    </div>
                  ))}
                </div>

                <div className="space-y-6 border-t border-gray-200 px-4 py-6">
                  {navigation.pages.map((page) => (
                    <div key={page.name} className="flow-root">
                      <a
                        href={page.href}
                        className="-m-2 block p-2 font-medium text-gray-900"
                      >
                        {page.name}
                      </a>
                    </div>
                  ))}
                </div>

                {/* Login/Logout and User Info - เหมือนเดิม */}
                <div className="space-y-6 border-t border-gray-200 px-4 py-6">
                  {isLoggedIn ? (
                    <>
                      {userData && (
                        <a
                          href="/setting"
                          className="-m-2 block p-2 font-medium text-gray-900"
                        >
                          {userData.fname} {userData.lname} (Profile)
                        </a>
                      )}
                      <a
                        href="/"
                        onClick={handleLogout}
                        className="-m-2 block p-2 font-medium text-gray-900"
                      >
                        Logout
                      </a>
                    </>
                  ) : (
                    <>
                      <div className="flow-root">
                        <a
                          href="/login"
                          className="-m-2 block p-2 font-medium text-gray-900"
                        >
                          Sign in
                        </a>
                      </div>
                      <div className="flow-root">
                        <a
                          href="/register"
                          className="-m-2 block p-2 font-medium text-gray-900"
                        >
                          Create account
                        </a>
                      </div>
                    </>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      <header className="relative bg-white">
        <nav
          aria-label="Top"
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        >
          <div className="border-b border-gray-200">
            <div className="flex h-16 items-center">
              <button
                type="button"
                className="relative rounded-md bg-white p-2 text-gray-400 lg:hidden"
                onClick={() => setOpen(true)}
              >
                <span className="absolute -inset-0.5" />
                <span className="sr-only">Open menu</span>
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              </button>

              {/* Logo */}
              <div className="ml-4 flex lg:ml-0">
                <a href="/">
                  <span className="sr-only">Your Company</span>
                  <img className="h-8 w-auto" src={logo} alt="" />
                </a>
              </div>

              {/* Desktop Links (ใช้ลิงก์ธรรมดาแทน Popover.Group) */}
              <div className="hidden lg:ml-8 lg:block lg:self-stretch">
                <div className="flex h-full space-x-8">
                  {/* Category Links */}
                  {navigation.categories.map((category) => (
                    <a
                      key={category.name}
                      href={category.href}
                      className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-800"
                    >
                      {category.name}
                    </a>
                  ))}

                  {/* Page Links */}
                  {navigation.pages.map((page) => (
                    <a
                      key={page.name}
                      href={page.href}
                      className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-800"
                    >
                      {page.name}
                    </a>
                  ))}
                </div>
              </div>

              <div className="ml-auto flex items-center">
                {isLoggedIn ? (
                  <>
                    {/* User Profile/Logout for Desktop - เหมือนเดิม */}
                    <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:space-x-6">
                      {userData && (
                        <div className="flex items-center space-x-6">
                          <img
                            src={profileImage}
                            alt="Profile Avatar"
                            className="w-10 h-10 rounded-full cursor-pointer"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                          />
                          <div className="relative">
                            <button
                              type="button"
                              className="text-sm font-medium text-gray-700 hover:text-gray-800"
                              onClick={() => setDropdownOpen(!dropdownOpen)}
                            >
                              {userData.fname} {userData.lname}
                            </button>
                            {dropdownOpen && (
                              <div className="absolute right-0 mt-6 w-48 bg-white rounded-md overflow-hidden shadow-xl z-50">
                                <a
                                  href="/Orderstatus"
                                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  Order Status
                                </a>
                                <a
                                  href="/SettingUser"
                                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  Settings
                                </a>
                                <a
                                  href="/"
                                  onClick={handleLogout}
                                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  Logout
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Sign In/Create Account for Desktop - เหมือนเดิม */}
                    <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-end lg:space-x-6">
                      <a
                        href="/login"
                        className="text-sm font-medium text-gray-700 hover:text-gray-800"
                      >
                        Sign in
                      </a>
                      <span
                        className="h-6 w-px bg-gray-200"
                        aria-hidden="true"
                      />
                      <a
                        href="/register"
                        className="text-sm font-medium text-gray-700 hover:text-gray-800"
                      >
                        Create account
                      </a>
                    </div>
                  </>
                )}
                {/* Cart Icon - เหมือนเดิม */}
                <div className="ml-4 flow-root lg:ml-6">
                  <a href="/cart" className="group -m-2 flex items-center p-2">
                    <ShoppingBagIcon
                      className="h-6 w-6 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                      aria-hidden="true"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700 group-hover:text-gray-800">
                      {selectedProducts.length}
                    </span>
                    <span className="sr-only">items in cart, view bag</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>
    </div>
  );
}
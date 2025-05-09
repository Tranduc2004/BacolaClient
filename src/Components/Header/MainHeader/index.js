import React, { useContext } from "react";
import Logo from "./Logo";
import SearchBar from "./SearchBar";
import UserControls from "./UserControls";
import MobileControls from "./MobileControls";
import { LocationSelector } from "../common/LocationSelector";
import { MyContext } from "../../../App";

const MainHeader = ({
  showLocationMenu,
  toggleLocationMenu,
  toggleMobileMenu,
  toggleMobileSearch,
  showMobileMenu,
}) => {
  const context = useContext(MyContext);
  return (
    <div className="w-full md:w-2/3 px-4 py-3 md:py-4 mx-auto">
      <div className="max-w-full flex flex-wrap items-center justify-between">
        {/* Logo */}
        <Logo />

        {/* Mobile Controls */}
        <div className="flex items-center md:hidden space-x-1">
          <MobileControls
            toggleMobileSearch={toggleMobileSearch}
            toggleMobileMenu={toggleMobileMenu}
            showMobileMenu={showMobileMenu}
          />
        </div>

        {/* Desktop Dropdowns & Controls - Hidden on Mobile */}
        <div className="hidden md:block">
          {context?.countryList?.length !== 0 && (
            <LocationSelector
              showLocationMenu={showLocationMenu}
              toggleLocationMenu={toggleLocationMenu}
            />
          )}
        </div>

        {/* Search Bar - Desktop */}
        <div className="hidden md:block flex-grow mx-4 max-w-xl">
          <SearchBar />
        </div>

        {/* My Account & Cart - Desktop */}
        <div className="hidden md:flex items-center space-x-4">
          <UserControls />
        </div>
      </div>
    </div>
  );
};

export default MainHeader;

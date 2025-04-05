import React from "react";
import { FiRefreshCw, FiSearch } from "react-icons/fi";

import { Button, Input } from "@/common/components/ui";

import styles from "./search.module.scss";

export interface SearchProps {
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
}

/**
 * Search component provides a search input with optional refresh functionality
 */
const Search: React.FC<SearchProps> = ({
  searchQuery,
  onSearchChange,
  onRefresh,
  isLoading = false,
  placeholder = "Search...",
  className = "",
}) => {
  return (
    <div className={`${styles.searchContainer} ${className}`}>
      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={onSearchChange}
        prefix={<FiSearch />}
        className={styles.searchInput}
        wrapperClassName={styles.searchInputWrapper}
      />

      {onRefresh && (
        <Button
          variant="secondary"
          onClick={onRefresh}
          disabled={isLoading}
          className={styles.refreshButton}
        >
          <FiRefreshCw className={isLoading ? styles.spinning : ""} />
          {isLoading ? "Refreshing..." : "Refresh"}
        </Button>
      )}
    </div>
  );
};

export default Search;

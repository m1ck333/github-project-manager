import React, { ReactNode } from "react";
import { FiCalendar, FiArrowRight, FiGithub } from "react-icons/fi";
import { Link } from "react-router-dom";

import styles from "./GridCard.module.scss";

export interface GridCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  avatar?: {
    src: string;
    alt: string;
  };
  stats?: Array<{
    icon: ReactNode;
    text: ReactNode;
  }>;
  actions?: Array<{
    icon: ReactNode;
    label: string;
    onClick: (e: React.MouseEvent) => void;
    ariaLabel?: string;
  }>;
  footer?: ReactNode;
  createdAt?: string;
  htmlUrl?: string;
  viewPath?: string;
  onClick?: () => void;
  className?: string;
}

const GridCard: React.FC<GridCardProps> = ({
  title,
  subtitle,
  description,
  avatar,
  stats,
  actions,
  footer,
  createdAt,
  htmlUrl,
  viewPath,
  onClick,
  className,
}) => {
  // Format the creation date if available
  const formattedDate = createdAt ? new Date(createdAt).toLocaleDateString() : undefined;

  return (
    <div className={`${styles.gridCard} ${className || ""}`} onClick={onClick}>
      <div className={styles.cardHeader}>
        <div className={styles.titleArea}>
          {avatar && (
            <div className={styles.avatarContainer}>
              <img src={avatar.src} alt={avatar.alt} className={styles.avatar} />
              {subtitle && <span className={styles.subtitle}>{subtitle}</span>}
            </div>
          )}
          <h3 className={styles.title}>{title}</h3>
        </div>

        {actions && actions.length > 0 && (
          <div className={styles.actionButtons}>
            {actions.map((action, index) => (
              <button
                key={`action-${index}`}
                className={styles.actionButton}
                onClick={(e) => {
                  e.stopPropagation();
                  action.onClick(e);
                }}
                aria-label={action.ariaLabel || action.label}
              >
                {action.icon}
              </button>
            ))}
          </div>
        )}
      </div>

      {description && (
        <div className={styles.description}>
          <p>{description}</p>
        </div>
      )}

      {stats && stats.length > 0 && (
        <div className={styles.stats}>
          {stats.map((stat, index) => (
            <div key={`stat-${index}`} className={styles.statItem}>
              {stat.icon}
              <span>{stat.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* Custom footer or standard footer */}
      {footer ? (
        <div className={styles.footer}>{footer}</div>
      ) : (
        (formattedDate || htmlUrl || viewPath) && (
          <div className={styles.footer}>
            {formattedDate && (
              <span className={styles.dateInfo}>
                <FiCalendar size={14} />
                <span>Created on {formattedDate}</span>
              </span>
            )}

            <div className={styles.footerLinks}>
              {htmlUrl && (
                <a
                  href={htmlUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className={styles.footerLink}
                >
                  <FiGithub size={14} /> View on GitHub
                </a>
              )}
              {viewPath && (
                <Link
                  to={viewPath}
                  className={styles.viewButton}
                  onClick={(e) => {
                    // Stop propagation to avoid double navigation
                    e.stopPropagation();
                    // If onClick handler exists, call it directly
                    if (onClick) {
                      onClick();
                    }
                  }}
                >
                  <FiArrowRight size={14} /> View Details
                </Link>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default GridCard;

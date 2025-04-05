import React, { ReactNode } from "react";
import { FiCalendar, FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";

import ViewOnGithub from "@/common/components/composed/ViewOnGithubLink";
import { Stack } from "@/common/components/ui/display";
import Typography from "@/common/components/ui/display/Typography";
import { formatDate } from "@/common/utils/date.utils";

import styles from "./grid-card.module.scss";

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
  // Format the creation date using our utility with default format
  const formattedDate = formatDate(createdAt);

  return (
    <div className={`${styles.gridCard} ${className || ""}`} onClick={onClick}>
      <Stack align="spread" className={styles.cardHeader}>
        <div className={styles.titleArea}>
          {avatar && (
            <Stack cross="center" className={styles.avatarContainer}>
              <img src={avatar.src} alt={avatar.alt} className={styles.avatar} />
              {subtitle && (
                <Typography variant="subtitle2" className={styles.subtitle}>
                  {subtitle}
                </Typography>
              )}
            </Stack>
          )}
          <Typography variant="h3" className={styles.title}>
            {title}
          </Typography>
        </div>

        {actions && actions.length > 0 && (
          <Stack className={styles.actionButtons}>
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
          </Stack>
        )}
      </Stack>

      {description && (
        <div className={styles.description}>
          <Typography variant="body2">{description}</Typography>
        </div>
      )}

      {stats && stats.length > 0 && (
        <Stack wrap className={styles.stats}>
          {stats.map((stat, index) => (
            <Stack cross="center" key={`stat-${index}`} className={styles.statItem}>
              {stat.icon}
              <Typography variant="body2" component="span">
                {stat.text}
              </Typography>
            </Stack>
          ))}
        </Stack>
      )}

      {/* Custom footer or standard footer */}
      {footer ? (
        <div className={styles.footer}>{footer}</div>
      ) : (
        (formattedDate || htmlUrl || viewPath) && (
          <Stack align="spread" className={styles.footer}>
            {formattedDate && (
              <Stack cross="center" className={styles.dateInfo}>
                <FiCalendar size={14} />
                <Typography variant="caption" component="span">
                  Created on {formattedDate}
                </Typography>
              </Stack>
            )}

            <Stack className={styles.footerLinks}>
              {htmlUrl && <ViewOnGithub link={htmlUrl} />}
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
                  <Stack cross="center" spacing={0.5}>
                    <FiArrowRight size={14} />
                    <Typography variant="button" component="span">
                      View Details
                    </Typography>
                  </Stack>
                </Link>
              )}
            </Stack>
          </Stack>
        )
      )}
    </div>
  );
};

export default GridCard;

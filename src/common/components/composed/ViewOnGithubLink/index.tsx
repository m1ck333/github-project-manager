import { FiGithub, FiExternalLink } from "react-icons/fi";

import styles from "./view-on-github-link.module.scss";

interface ViewOnGithubProps {
  link: string;
}

const ViewOnGithub = ({ link }: ViewOnGithubProps) => {
  return (
    <a href={link} target="_blank" rel="noopener noreferrer" className={styles.githubLink}>
      <FiGithub /> View on GitHub <FiExternalLink size={14} />
    </a>
  );
};

export default ViewOnGithub;

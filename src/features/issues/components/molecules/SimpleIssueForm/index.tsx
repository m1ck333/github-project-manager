import React from "react";

import IssueForm, { IssueFormProps } from "../IssueForm";

/**
 * @deprecated Use IssueForm with simple=true prop instead.
 * This component is maintained for backward compatibility.
 */
const SimpleIssueForm: React.FC<IssueFormProps> = (props) => {
  return <IssueForm {...props} simple={true} />;
};

export default SimpleIssueForm;
export type { IssueFormProps };

import React, { useState } from "react";

import { Button, Input, Select } from "@/common/components/ui";
import type { SelectOption } from "@/common/components/ui/form/Select";

import styles from "./add-collaborator-form.module.scss";

interface AddCollaboratorFormProps {
  onSubmit: (username: string, permission: string) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

const AddCollaboratorForm: React.FC<AddCollaboratorFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const [username, setUsername] = useState("");
  const [permission, setPermission] = useState<"read" | "write" | "admin">("read");

  const permissionOptions: SelectOption[] = [
    { value: "read", label: "Read" },
    { value: "write", label: "Write" },
    { value: "admin", label: "Admin" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;
    await onSubmit(username, permission);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.addForm}>
      <div className={styles.formGroup}>
        <label htmlFor="username">GitHub Username</label>
        <Input
          id="username"
          placeholder="e.g., octocat"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div className={styles.formGroup}>
        <label htmlFor="permission">Permission Level</label>
        <Select
          id="permission"
          value={permission}
          onChange={(e) => setPermission(e.target.value as "read" | "write" | "admin")}
          options={permissionOptions}
        />
      </div>
      <div className={styles.formActions}>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting || !username}>
          {isSubmitting ? "Adding..." : "Add Collaborator"}
        </Button>
      </div>
    </form>
  );
};

export default AddCollaboratorForm;

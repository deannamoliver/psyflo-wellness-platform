"use client";

import { Building2, Mail, Plus, Stethoscope, Trash2, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/tailwind-utils";

type UserAccess = {
  id: string;
  email: string;
  name: string;
  accessType: "practice_management" | "provider";
  patients?: string[];
};

// Mock data for demo
const MOCK_USERS: UserAccess[] = [
  { id: "1", email: "admin@clinic.com", name: "Sarah Johnson", accessType: "practice_management" },
  { id: "2", email: "dr.smith@clinic.com", name: "Dr. Michael Smith", accessType: "provider", patients: ["patient1@email.com", "patient2@email.com"] },
  { id: "3", email: "dr.chen@clinic.com", name: "Dr. Lisa Chen", accessType: "provider", patients: ["patient3@email.com"] },
];

export function AccessRestrictionsSection() {
  const [users, setUsers] = useState<UserAccess[]>(MOCK_USERS);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserAccessType, setNewUserAccessType] = useState<"practice_management" | "provider">("provider");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newPatientEmail, setNewPatientEmail] = useState("");

  const handleAddUser = () => {
    if (newUserEmail && newUserName) {
      setUsers([...users, {
        id: `user-${Date.now()}`,
        email: newUserEmail,
        name: newUserName,
        accessType: newUserAccessType,
        patients: newUserAccessType === "provider" ? [] : undefined,
      }]);
      setNewUserEmail("");
      setNewUserName("");
      setShowAddUser(false);
    }
  };

  const handleAddPatient = (userId: string) => {
    if (newPatientEmail) {
      setUsers(users.map(u => 
        u.id === userId 
          ? { ...u, patients: [...(u.patients || []), newPatientEmail] }
          : u
      ));
      setNewPatientEmail("");
    }
  };

  const handleRemovePatient = (userId: string, patientEmail: string) => {
    setUsers(users.map(u => 
      u.id === userId 
        ? { ...u, patients: (u.patients || []).filter(p => p !== patientEmail) }
        : u
    ));
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-lg">
              User Access & Permissions
            </h2>
            <p className="text-gray-500 text-sm">
              Manage who has access to this location and their dashboard permissions
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowAddUser(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <UserPlus className="h-4 w-4" />
          Add User
        </button>
      </div>

      {/* Add User Form */}
      {showAddUser && (
        <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="mb-3 font-semibold text-gray-900">Add New User</h3>
          <div className="grid grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Full Name"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              type="email"
              placeholder="Email Address"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <select
              value={newUserAccessType}
              onChange={(e) => setNewUserAccessType(e.target.value as "practice_management" | "provider")}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="provider">Provider Dashboard Access</option>
              <option value="practice_management">Practice Management Dashboard Access</option>
            </select>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={handleAddUser}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Add User
            </button>
            <button
              type="button"
              onClick={() => setShowAddUser(false)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Users List */}
      <div className="space-y-4">
        {users.map((user) => (
          <div key={user.id} className="rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full",
                  user.accessType === "practice_management" ? "bg-teal-100" : "bg-blue-100"
                )}>
                  {user.accessType === "practice_management" ? (
                    <Building2 className="h-5 w-5 text-teal-600" />
                  ) : (
                    <Stethoscope className="h-5 w-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-gray-500 text-sm">{user.email}</p>
                </div>
              </div>
              <span className={cn(
                "rounded-full px-3 py-1 text-xs font-medium",
                user.accessType === "practice_management" 
                  ? "bg-teal-100 text-teal-700" 
                  : "bg-blue-100 text-blue-700"
              )}>
                {user.accessType === "practice_management" ? "Practice Management" : "Provider Dashboard"}
              </span>
            </div>

            {/* Patient Assignment for Providers */}
            {user.accessType === "provider" && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-700">Assigned Patients</p>
                  <button
                    type="button"
                    onClick={() => setSelectedUserId(selectedUserId === user.id ? null : user.id)}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="h-3 w-3" />
                    Add Patient
                  </button>
                </div>

                {selectedUserId === user.id && (
                  <div className="mb-3 flex gap-2">
                    <input
                      type="email"
                      placeholder="Patient email address"
                      value={newPatientEmail}
                      onChange={(e) => setNewPatientEmail(e.target.value)}
                      className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddPatient(user.id)}
                      className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                )}

                {user.patients && user.patients.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {user.patients.map((patient) => (
                      <div key={patient} className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1">
                        <Mail className="h-3 w-3 text-gray-500" />
                        <span className="text-sm text-gray-700">{patient}</span>
                        <button
                          type="button"
                          onClick={() => handleRemovePatient(user.id, patient)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">No patients assigned yet</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

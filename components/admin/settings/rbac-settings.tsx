import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const roles = [
  {
    name: "SuperAdmin",
    description: "Full access to all system features and settings.",
  },
  {
    name: "Admin",
    description: "Manages listings, users, and site content.",
  },
  {
    name: "Moderator",
    description: "Approves and manages user-submitted content.",
  },
  {
    name: "ReadOnly",
    description: "Can view all content but cannot make changes.",
  },
];

export default function RbacSettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Role-Based Access Control (RBAC)</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead>Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.name}>
                <TableCell className="font-medium">{role.name}</TableCell>
                <TableCell>{role.description}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
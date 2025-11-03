import { useState, useEffect } from "react";
import { supabase } from "./lib/supabase";
import { useStore } from "./store/useStore";
import { useAuth } from "./hooks/useAuth";
import { Login } from "./components/Auth/Login";
import { Signup } from "./components/Auth/Signup";
import { BusinessSetup } from "./components/Auth/BusinessSetup";
import { Calendar } from "./components/Calendar/Calendar";
import { EmployeeList } from "./components/Employees/EmployeeList";
import { ChatComposer } from "./components/Chat/ChatComposer";
import { EditShiftModal } from "./components/Modals/EditShiftModal";
import { Button } from "./components/common/Button";
import type { Shift } from "./types";

type AuthView = "login" | "signup";

function App() {
  const { user, loading, currentBusiness, setCurrentBusiness } = useStore();
  const { signOut } = useAuth();
  const [authView, setAuthView] = useState<AuthView>("login");
  const [isLoadingBusiness, setIsLoadingBusiness] = useState(true);
  const [shiftToEdit, setShiftToEdit] = useState<Shift | null>(null);
  const [dateToAddShift, setDateToAddShift] = useState<Date | null>(null);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);

  // Check if user has a business
  useEffect(() => {
    const checkBusiness = async () => {
      if (!user) {
        setIsLoadingBusiness(false);
        return;
      }

      try {
        // Check if user owns a business
        const { data: ownedBusinesses, error: ownerError } = await supabase
          .from("businesses")
          .select("*")
          .eq("owner_user_id", user.id)
          .limit(1);

        if (ownerError) throw ownerError;

        if (ownedBusinesses && ownedBusinesses.length > 0) {
          setCurrentBusiness(ownedBusinesses[0]);
          setIsLoadingBusiness(false);
          return;
        }

        // Check if user is an employee
        const { data: employeeRecords, error: employeeError } = await supabase
          .from("employees")
          .select("business_id, businesses(*)")
          .eq("user_id", user.id)
          .limit(1);

        if (employeeError) throw employeeError;

        if (employeeRecords && employeeRecords.length > 0) {
          setCurrentBusiness(employeeRecords[0].businesses as any);
          setIsLoadingBusiness(false);
          return;
        }

        // User has no business
        setIsLoadingBusiness(false);
      } catch (err) {
        console.error("Error checking business:", err);
        setIsLoadingBusiness(false);
      }
    };

    checkBusiness();
  }, [user, setCurrentBusiness]);

  const handleAddShift = (date: Date) => {
    setDateToAddShift(date);
    setShiftToEdit(null);
    setIsShiftModalOpen(true);
  };

  const handleEditShift = (shift: Shift) => {
    setShiftToEdit(shift);
    setDateToAddShift(null);
    setIsShiftModalOpen(true);
  };

  const handleCloseShiftModal = () => {
    setIsShiftModalOpen(false);
    setShiftToEdit(null);
    setDateToAddShift(null);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error("Failed to sign out:", err);
    }
  };

  // Loading state
  if (loading || (user && isLoadingBusiness)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return authView === "login" ? (
      <Login onSwitchToSignup={() => setAuthView("signup")} />
    ) : (
      <Signup onSwitchToLogin={() => setAuthView("login")} />
    );
  }

  // No business setup
  if (!currentBusiness) {
    return <BusinessSetup />;
  }

  // Main app
  const isManager = currentBusiness.owner_user_id === user.id;

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {currentBusiness.name}
            </h1>
            <p className="text-sm text-gray-600">
              {isManager ? "Manager" : "Employee"} • {currentBusiness.timezone}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {user.user_metadata?.name || user.email}
              </p>
              <p className="text-xs text-gray-600">{user.email}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Calendar section */}
        <div className="flex-1 p-6 overflow-auto">
          <Calendar onAddShift={handleAddShift} onEditShift={handleEditShift} />
        </div>

        {/* Right sidebar */}
        <div className="w-80 bg-white border-l border-gray-200 p-6 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto">
            <EmployeeList />
          </div>
          {isManager && (
            <div className="mt-4">
              <ChatComposer />
            </div>
          )}
        </div>
      </div>

      {/* Shift modal */}
      <EditShiftModal
        isOpen={isShiftModalOpen}
        onClose={handleCloseShiftModal}
        shift={shiftToEdit}
        initialDate={dateToAddShift || undefined}
      />
    </div>
  );
}

export default App;

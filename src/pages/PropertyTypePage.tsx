import { Navigate } from "react-router-dom";
import { buildLocalizedPath } from "@/routes";

/** Legacy property-type URLs redirect to home — villas for rent only */
const PropertyTypePage = () => <Navigate to={buildLocalizedPath.home()} replace />;

export default PropertyTypePage;

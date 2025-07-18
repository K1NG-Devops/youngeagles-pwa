import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import AdSenseScript, {
  HeaderBannerAd,
  MobileBannerAd,
  FooterBannerAd,
  MainDisplayAd,
} from "../components/ads/AdSenseComponents"
import { useAdBlockDetector } from "../components/ads/AdBlockDetector"

// Import your existing page components
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import Activities from "./pages/Activities"
import Children from "./pages/Children"
import Classes from "./pages/Classes"
import ClassRegister from "./pages/ClassRegister"
import Homework from "./pages/Homework"
import HomeworkDetails from "./pages/HomeworkDetails"
import SubmitWork from "./pages/SubmitWork"
import TeacherDashboard from "./pages/TeacherDashboard"
import TeacherHomeworkView from "./pages/TeacherHomeworkView"
import AdminDashboard from "./pages/AdminDashboard"
import AdminPaymentReview from "./pages/AdminPaymentReview"
import Management from "./pages/Management"
import Notifications from "./pages/Notifications"
import ParentProfile from "./pages/ParentProfile"
import Settings from "./pages/Settings"
import Events from "./pages/Events"
import Checkout from "./pages/Checkout"
import PaymentSuccess from "./pages/PaymentSuccess"
import PaymentCancel from "./pages/PaymentCancel"
import PaymentProofs from "./pages/PaymentProofs"
import Contact from "./pages/Contact"
import PrivacyPolicy from "./pages/PrivacyPolicy"
import TermsOfService from "./pages/TermsOfService"
import SwipeDemo from "./pages/SwipeDemo"
import AdTest from "./pages/AdTest"
import AdFallbackTest from "./pages/AdFallbackTest"

// Assuming you have a PageWrapper component for common layout elements
import PageWrapper from "./components/PageWrapper"

function App() {
  const { isAdBlocked } = useAdBlockDetector()
  const isAdSenseEnabled = import.meta.env.VITE_ADSENSE_ENABLED === "true"

  return (
    <Router>
      {isAdSenseEnabled && <AdSenseScript />}
      <div className="App">
        {isAdBlocked && (
          <div className="bg-red-500 text-white p-2 text-center">
            Ad Blocker Detected! Please disable it to support our content.
          </div>
        )}

        {/* Example Ad Placements */}
        <HeaderBannerAd className="my-4" style={{ height: "90px", width: "728px", margin: "0 auto" }} />
        <MobileBannerAd className="my-2" style={{ height: "50px", width: "320px", margin: "0 auto" }} />

        <Routes>
          <Route
            path="/"
            element={
              <PageWrapper>
                <Home />
              </PageWrapper>
            }
          />
          <Route
            path="/login"
            element={
              <PageWrapper>
                <Login />
              </PageWrapper>
            }
          />
          <Route
            path="/register"
            element={
              <PageWrapper>
                <Register />
              </PageWrapper>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PageWrapper>
                <Dashboard />
              </PageWrapper>
            }
          />
          <Route
            path="/activities"
            element={
              <PageWrapper>
                <Activities />
              </PageWrapper>
            }
          />
          <Route
            path="/children"
            element={
              <PageWrapper>
                <Children />
              </PageWrapper>
            }
          />
          <Route
            path="/classes"
            element={
              <PageWrapper>
                <Classes />
              </PageWrapper>
            }
          />
          <Route
            path="/class-register"
            element={
              <PageWrapper>
                <ClassRegister />
              </PageWrapper>
            }
          />
          <Route
            path="/homework"
            element={
              <PageWrapper>
                <Homework />
              </PageWrapper>
            }
          />
          <Route
            path="/homework/:id"
            element={
              <PageWrapper>
                <HomeworkDetails />
              </PageWrapper>
            }
          />
          <Route
            path="/submit-work/:id"
            element={
              <PageWrapper>
                <SubmitWork />
              </PageWrapper>
            }
          />
          <Route
            path="/teacher-dashboard"
            element={
              <PageWrapper>
                <TeacherDashboard />
              </PageWrapper>
            }
          />
          <Route
            path="/teacher-homework-view/:id"
            element={
              <PageWrapper>
                <TeacherHomeworkView />
              </PageWrapper>
            }
          />
          <Route
            path="/admin-dashboard"
            element={
              <PageWrapper>
                <AdminDashboard />
              </PageWrapper>
            }
          />
          <Route
            path="/admin-payment-review"
            element={
              <PageWrapper>
                <AdminPaymentReview />
              </PageWrapper>
            }
          />
          <Route
            path="/management"
            element={
              <PageWrapper>
                <Management />
              </PageWrapper>
            }
          />
          <Route
            path="/notifications"
            element={
              <PageWrapper>
                <Notifications />
              </PageWrapper>
            }
          />
          <Route
            path="/parent-profile"
            element={
              <PageWrapper>
                <ParentProfile />
              </PageWrapper>
            }
          />
          <Route
            path="/settings"
            element={
              <PageWrapper>
                <Settings />
              </PageWrapper>
            }
          />
          <Route
            path="/events"
            element={
              <PageWrapper>
                <Events />
              </PageWrapper>
            }
          />
          <Route
            path="/checkout"
            element={
              <PageWrapper>
                <Checkout />
              </PageWrapper>
            }
          />
          <Route
            path="/payment-success"
            element={
              <PageWrapper>
                <PaymentSuccess />
              </PageWrapper>
            }
          />
          <Route
            path="/payment-cancel"
            element={
              <PageWrapper>
                <PaymentCancel />
              </PageWrapper>
            }
          />
          <Route
            path="/payment-proofs"
            element={
              <PageWrapper>
                <PaymentProofs />
              </PageWrapper>
            }
          />
          <Route
            path="/contact"
            element={
              <PageWrapper>
                <Contact />
              </PageWrapper>
            }
          />
          <Route
            path="/privacy-policy"
            element={
              <PageWrapper>
                <PrivacyPolicy />
              </PageWrapper>
            }
          />
          <Route
            path="/terms-of-service"
            element={
              <PageWrapper>
                <TermsOfService />
              </PageWrapper>
            }
          />
          <Route
            path="/swipe-demo"
            element={
              <PageWrapper>
                <SwipeDemo />
              </PageWrapper>
            }
          />
          <Route
            path="/ad-test"
            element={
              <PageWrapper>
                <AdTest />
              </PageWrapper>
            }
          />
          <Route
            path="/ad-fallback-test"
            element={
              <PageWrapper>
                <AdFallbackTest />
              </PageWrapper>
            }
          />
        </Routes>

        {/* Example Ad Placements */}
        <FooterBannerAd className="my-4" style={{ height: "90px", width: "728px", margin: "0 auto" }} />
        <MainDisplayAd className="my-4" style={{ height: "250px", width: "300px", margin: "0 auto" }} />
        {/* You can place other ads like SidebarSkyscraperAd, ContentRectangleAd, etc. within specific page components */}
      </div>
    </Router>
  )
}

export default App

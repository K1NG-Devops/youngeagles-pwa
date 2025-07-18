import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import AdSenseScript, {
  MobileBannerAd,
  HeaderBannerAd,
  FooterBannerAd,
  MainDisplayAd,
} from "../components/ads/AdSenseComponents"
import { useAdBlockDetector } from "../components/ads/AdBlockDetector"
import { useMobileAdOptimizer } from "../components/ads/MobileAdOptimizer"

// Import your existing page components
import Home from "./pages/Home"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import Activities from "./pages/Activities"
import Children from "./pages/Children"
import Classes from "./pages/Classes"
import ClassRegister from "./pages/ClassRegister"
import Contact from "./pages/Contact"
import Events from "./pages/Events"
import Homework from "./pages/Homework"
import HomeworkDetails from "./pages/HomeworkDetails"
import Notifications from "./pages/Notifications"
import ParentProfile from "./pages/ParentProfile"
import Settings from "./pages/Settings"
import SubmitWork from "./pages/SubmitWork"
import TeacherDashboard from "./pages/TeacherDashboard"
import TeacherHomeworkView from "./pages/TeacherHomeworkView"
import AdminDashboard from "./pages/AdminDashboard"
import Management from "./pages/Management"
import Checkout from "./pages/Checkout"
import PaymentSuccess from "./pages/PaymentSuccess"
import PaymentCancel from "./pages/PaymentCancel"
import PaymentProofs from "./pages/PaymentProofs"
import AdminPaymentReview from "./pages/AdminPaymentReview"
import PrivacyPolicy from "./pages/PrivacyPolicy"
import TermsOfService from "./pages/TermsOfService"
import SwipeDemo from "./pages/SwipeDemo"
import AdFallbackTest from "./pages/AdFallbackTest" // Assuming you have this for testing
import AdTest from "./pages/AdTest" // Assuming you have this for testing

// Import your layout/wrapper components
import PageWrapper from "./components/PageWrapper" // Assuming this wraps your main content
import { SubscriptionProvider } from "./contexts/SubscriptionContext" // Assuming you have this context

function App() {
  const { adBlocked } = useAdBlockDetector()
  const { isMobile } = useMobileAdOptimizer()

  return (
    <SubscriptionProvider>
      <Router>
        <AdSenseScript /> {/* This loads the main AdSense script */}
        <div className="App">
          {/* Example of placing ads */}
          <HeaderBannerAd className="my-4" /> {/* Desktop header ad */}
          <MobileBannerAd className="my-4" /> {/* Mobile header ad */}
          {adBlocked && (
            <div className="ad-block-message text-center text-red-500 p-2 bg-red-100">
              It looks like you're using an ad blocker. Please consider disabling it to support us.
            </div>
          )}
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
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
              path="/contact"
              element={
                <PageWrapper>
                  <Contact />
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
              path="/management"
              element={
                <PageWrapper>
                  <Management />
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
              path="/admin-payment-review/:id"
              element={
                <PageWrapper>
                  <AdminPaymentReview />
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
              path="/ad-fallback-test"
              element={
                <PageWrapper>
                  <AdFallbackTest />
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
          </Routes>
          {/* Example of placing ads */}
          <FooterBannerAd className="my-4" /> {/* Footer ad */}
          <MainDisplayAd className="my-4" /> {/* General display ad */}
        </div>
      </Router>
    </SubscriptionProvider>
  )
}

export default App

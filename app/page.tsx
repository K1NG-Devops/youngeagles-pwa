"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  HeaderBannerAd,
  FooterBannerAd,
  ResponsiveAd,
  ContentRectangleAd,
  MobileBannerAd,
  InFeedNativeAd,
} from "@/components/ads/AdSenseComponents"
import { BookOpen, Users, Trophy, Star, Calendar, MapPin, Phone, Mail, Globe } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header with Ad */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Young Eagles</h1>
                <p className="text-sm text-gray-600">Educational Excellence</p>
              </div>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#programs" className="text-gray-700 hover:text-blue-600">
                Programs
              </a>
              <a href="#about" className="text-gray-700 hover:text-blue-600">
                About
              </a>
              <a href="#contact" className="text-gray-700 hover:text-blue-600">
                Contact
              </a>
            </nav>
          </div>
        </div>

        {/* Header Ad */}
        <div className="border-t border-gray-200 py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
            <HeaderBannerAd pageId="homepage" className="max-w-full" />
          </div>
        </div>
      </header>

      {/* Mobile Banner Ad */}
      <div className="md:hidden bg-white border-b border-gray-200 py-2">
        <div className="flex justify-center">
          <MobileBannerAd pageId="homepage" />
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Empowering Young Minds to
              <span className="text-blue-600"> Soar High</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Join our comprehensive educational programs designed to nurture creativity, critical thinking, and
              leadership skills in the next generation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                Explore Programs
              </Button>
              <Button size="lg" variant="outline">
                Schedule a Visit
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Students Enrolled</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-600 mb-2">95%</div>
              <div className="text-gray-600">Success Rate</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-purple-600 mb-2">50+</div>
              <div className="text-gray-600">Expert Teachers</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-orange-600 mb-2">10+</div>
              <div className="text-gray-600">Years Experience</div>
            </CardContent>
          </Card>
        </section>

        {/* Content with Ads */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-16">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="programs" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="programs">Programs</TabsTrigger>
                <TabsTrigger value="activities">Activities</TabsTrigger>
                <TabsTrigger value="achievements">Achievements</TabsTrigger>
              </TabsList>

              <TabsContent value="programs" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-blue-600" />
                        Academic Excellence
                      </CardTitle>
                      <CardDescription>Comprehensive curriculum covering all core subjects</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Mathematics & Science</li>
                        <li>• Language Arts & Literature</li>
                        <li>• Social Studies & History</li>
                        <li>• Foreign Languages</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-green-600" />
                        Leadership Development
                      </CardTitle>
                      <CardDescription>Building tomorrow's leaders through practical experience</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Student Government</li>
                        <li>• Community Service Projects</li>
                        <li>• Public Speaking Training</li>
                        <li>• Team Building Activities</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                {/* In-Feed Native Ad */}
                <div className="my-8">
                  <InFeedNativeAd pageId="homepage" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-600" />
                        Creative Arts
                      </CardTitle>
                      <CardDescription>Nurturing artistic talents and creative expression</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Visual Arts & Design</li>
                        <li>• Music & Performance</li>
                        <li>• Drama & Theater</li>
                        <li>• Digital Media Creation</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="w-5 h-5 text-purple-600" />
                        STEM Innovation
                      </CardTitle>
                      <CardDescription>Hands-on science, technology, engineering, and math</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Robotics & Programming</li>
                        <li>• Laboratory Experiments</li>
                        <li>• Engineering Challenges</li>
                        <li>• Innovation Projects</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="activities" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Sports & Fitness</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">Physical education and competitive sports programs</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">Soccer</Badge>
                        <Badge variant="secondary">Basketball</Badge>
                        <Badge variant="secondary">Swimming</Badge>
                        <Badge variant="secondary">Track & Field</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Clubs & Societies</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">Extracurricular activities for diverse interests</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">Debate Club</Badge>
                        <Badge variant="secondary">Science Fair</Badge>
                        <Badge variant="secondary">Chess Club</Badge>
                        <Badge variant="secondary">Art Society</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Field Trips</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 mb-4">Educational excursions and real-world learning</p>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">Museums</Badge>
                        <Badge variant="secondary">Science Centers</Badge>
                        <Badge variant="secondary">Historical Sites</Badge>
                        <Badge variant="secondary">Nature Parks</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="achievements" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Academic Awards</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        <div>
                          <div className="font-medium">National Science Fair Winner</div>
                          <div className="text-sm text-gray-600">2023 - 1st Place</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Trophy className="w-5 h-5 text-silver" />
                        <div>
                          <div className="font-medium">Math Olympiad Champions</div>
                          <div className="text-sm text-gray-600">2023 - Regional Winners</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Trophy className="w-5 h-5 text-yellow-600" />
                        <div>
                          <div className="font-medium">Debate Tournament</div>
                          <div className="text-sm text-gray-600">2023 - State Champions</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Recognition</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Star className="w-5 h-5 text-blue-500" />
                        <div>
                          <div className="font-medium">Excellence in Education Award</div>
                          <div className="text-sm text-gray-600">Ministry of Education</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Star className="w-5 h-5 text-green-500" />
                        <div>
                          <div className="font-medium">Community Impact Award</div>
                          <div className="text-sm text-gray-600">Local Government</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Star className="w-5 h-5 text-purple-500" />
                        <div>
                          <div className="font-medium">Innovation in Teaching</div>
                          <div className="text-sm text-gray-600">Education Board</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar with Ad */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Responsive Ad */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <ResponsiveAd placement="sidebar" pageId="homepage" />
              </div>

              {/* Quick Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-medium text-sm">School Hours</div>
                      <div className="text-xs text-gray-600">8:00 AM - 3:00 PM</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-medium text-sm">Location</div>
                      <div className="text-xs text-gray-600">123 Education St, City</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-medium text-sm">Phone</div>
                      <div className="text-xs text-gray-600">(555) 123-4567</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <div>
                      <div className="font-medium text-sm">Email</div>
                      <div className="text-xs text-gray-600">info@youngeagles.edu</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Content Rectangle Ad */}
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <ContentRectangleAd pageId="homepage" />
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <section className="bg-blue-600 rounded-2xl p-8 text-center text-white mb-16">
          <h3 className="text-3xl font-bold mb-4">Ready to Join Our Community?</h3>
          <p className="text-xl mb-6 opacity-90">Take the first step towards your child's bright future</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary">
              Apply Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-blue-600 bg-transparent"
            >
              Download Brochure
            </Button>
          </div>
        </section>
      </main>

      {/* Footer with Ad */}
      <footer className="bg-gray-900 text-white">
        {/* Footer Ad */}
        <div className="border-b border-gray-800 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-center">
            <FooterBannerAd pageId="homepage" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Young Eagles</h3>
                  <p className="text-gray-400">Educational Excellence</p>
                </div>
              </div>
              <p className="text-gray-400 mb-4">
                Empowering young minds through innovative education, creative learning, and character development since
                2013.
              </p>
              <div className="flex space-x-4">
                <Globe className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                <Mail className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
                <Phone className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer" />
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Programs
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Admissions
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Faculty
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    News & Events
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Info</h4>
              <ul className="space-y-2 text-gray-400">
                <li>123 Education Street</li>
                <li>Learning City, LC 12345</li>
                <li>Phone: (555) 123-4567</li>
                <li>Email: info@youngeagles.edu</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Young Eagles Educational Institution. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

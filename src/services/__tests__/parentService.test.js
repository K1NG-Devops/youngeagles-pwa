import { describe, it, expect, vi, beforeEach } from 'vitest'
import parentService from '../parentService.js'

// Mock the httpClient module
vi.mock('../httpClient.js', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  }
}))

import { api } from '../httpClient.js'

describe('ParentService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getHomework', () => {
    it('should return homework data in the correct format when API returns success response', async () => {
      // Mock API response - testing the expected JSON shape
      const mockApiResponse = {
        data: {
          success: true,
          homework: [
            {
              id: 1,
              title: 'Math Assignment 1',
              subject: 'Mathematics',
              dueDate: '2024-01-15',
              status: 'pending',
              description: 'Complete exercises 1-10'
            },
            {
              id: 2,
              title: 'Science Lab Report',
              subject: 'Science',
              dueDate: '2024-01-20',
              status: 'submitted',
              description: 'Write lab report on chemical reactions'
            }
          ],
          child: {
            id: 1,
            name: 'John Doe'
          },
          total: 2
        }
      }

      api.get.mockResolvedValue(mockApiResponse)

      const result = await parentService.getHomework('1', '1')

      // Verify the service returns the expected format: {success, data: {homework}}
      expect(result).toEqual({
        success: true,
        data: {
          homework: [
            {
              id: 1,
              title: 'Math Assignment 1',
              subject: 'Mathematics',
              dueDate: '2024-01-15',
              status: 'pending',
              description: 'Complete exercises 1-10',
              submission: null
            },
            {
              id: 2,
              title: 'Science Lab Report',
              subject: 'Science',
              dueDate: '2024-01-20',
              status: 'submitted',
              description: 'Write lab report on chemical reactions',
              submission: { status: 'submitted' }
            }
          ]
        }
      })

      // Verify API was called with correct parameters
      expect(api.get).toHaveBeenCalledWith('/parent/1/child/1/homework', {
        headers: {
          'X-Request-Source': 'pwa-parent-homework',
          'Cache-Control': 'no-cache',
        }
      })
    })

    it('should handle API response with direct homework array format', async () => {
      // Mock API response - testing alternative JSON shape
      const mockApiResponse = {
        data: {
          homework: [
            {
              id: 3,
              title: 'English Essay',
              subject: 'English',
              dueDate: '2024-01-25',
              status: 'pending'
            }
          ]
        }
      }

      api.get.mockResolvedValue(mockApiResponse)

      const result = await parentService.getHomework('2', '1')

      expect(result).toEqual({
        success: true,
        data: {
          homework: [
            {
              id: 3,
              title: 'English Essay',
              subject: 'English',
              dueDate: '2024-01-25',
              status: 'pending',
              submission: null
            }
          ]
        }
      })
    })

    it('should handle API response with direct array format', async () => {
      // Mock API response - testing direct array JSON shape
      const mockApiResponse = {
        data: [
          {
            id: 4,
            title: 'History Project',
            subject: 'History',
            dueDate: '2024-01-30',
            status: 'submitted'
          }
        ]
      }

      api.get.mockResolvedValue(mockApiResponse)

      const result = await parentService.getHomework('3', '1')

      expect(result).toEqual({
        success: true,
        data: {
          homework: [
            {
              id: 4,
              title: 'History Project',
              subject: 'History',
              dueDate: '2024-01-30',
              status: 'submitted',
              submission: { status: 'submitted' }
            }
          ]
        }
      })
    })

    it('should handle API errors and return error response', async () => {
      const mockError = new Error('Network error')
      mockError.response = {
        data: { message: 'API server unavailable' }
      }

      api.get.mockRejectedValue(mockError)

      const result = await parentService.getHomework('1', '1')

      expect(result).toEqual({
        success: false,
        error: 'API server unavailable',
        data: {
          homework: [],
          total: 0,
          child: null
        }
      })
    })

    it('should handle empty homework response', async () => {
      const mockApiResponse = {
        data: {
          success: true,
          homework: []
        }
      }

      api.get.mockResolvedValue(mockApiResponse)

      const result = await parentService.getHomework('1', '1')

      expect(result).toEqual({
        success: true,
        data: {
          homework: []
        }
      })
    })
  })
})

import * as core from '@actions/core'
import * as exec from '@actions/exec'
import * as main from '../src/main'

// Mock the action's main function
const runMock = jest.spyOn(main, 'run')

// Other utilities
const timeRegex = /^\d{2}:\d{2}:\d{2}/

// Mock the GitHub Actions core library
let debugMock: jest.SpyInstance
let warningMock: jest.SpyInstance
let errorMock: jest.SpyInstance
let getInputMock: jest.SpyInstance
let setFailedMock: jest.SpyInstance
let setOutputMock: jest.SpyInstance
let execMock: jest.SpyInstance

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    debugMock = jest.spyOn(core, 'debug').mockImplementation()
    warningMock = jest.spyOn(core, 'warning').mockImplementation()
    errorMock = jest.spyOn(core, 'error').mockImplementation()
    getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
    setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()
    execMock = jest.spyOn(exec, 'exec').mockImplementation()
  })

  it('sets the time output', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'milliseconds':
          return '500'
        default:
          return ''
      }
    })
    execMock.mockReturnValue(Promise.resolve())

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(warningMock).toHaveBeenNthCalledWith(
      1,
      'Waiting 500 milliseconds ...'
    )
    expect(debugMock).toHaveBeenNthCalledWith(
      1,
      expect.stringMatching(timeRegex)
    )
    expect(debugMock).toHaveBeenNthCalledWith(
      2,
      expect.stringMatching(timeRegex)
    )
    expect(setOutputMock).toHaveBeenNthCalledWith(
      1,
      'time',
      expect.stringMatching(timeRegex)
    )
    expect(errorMock).not.toHaveBeenCalled()
  })

  it('sets a failed status', async () => {
    // Set the action's inputs as return values from core.getInput()
    getInputMock.mockImplementation((name: string): string => {
      switch (name) {
        case 'milliseconds':
          return 'this is not a number'
        default:
          return ''
      }
    })

    await main.run()
    expect(runMock).toHaveReturned()

    // Verify that all of the core library functions were called correctly
    expect(setFailedMock).toHaveBeenNthCalledWith(
      1,
      'milliseconds not a number'
    )
    expect(errorMock).not.toHaveBeenCalled()
  })
})

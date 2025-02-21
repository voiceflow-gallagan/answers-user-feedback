const SVG_Thumb = `<svg width="24px" height="24px" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M5.29398 20.4966C4.56534 20.4966 4 19.8827 4 19.1539V12.3847C4 11.6559 4.56534 11.042 5.29398 11.042H8.12364L10.8534 4.92738C10.9558 4.69809 11.1677 4.54023 11.4114 4.50434L11.5175 4.49658C12.3273 4.49658 13.0978 4.85402 13.6571 5.48039C14.2015 6.09009 14.5034 6.90649 14.5034 7.7535L14.5027 8.92295L18.1434 8.92346C18.6445 8.92346 19.1173 9.13931 19.4618 9.51188L19.5612 9.62829C19.8955 10.0523 20.0479 10.6054 19.9868 11.1531L19.1398 18.742C19.0297 19.7286 18.2529 20.4966 17.2964 20.4966H8.69422H5.29398ZM11.9545 6.02658L9.41727 11.7111L9.42149 11.7693L9.42091 19.042H17.2964C17.4587 19.042 17.6222 18.8982 17.6784 18.6701L17.6942 18.5807L18.5412 10.9918C18.5604 10.8194 18.5134 10.6486 18.4189 10.5287C18.3398 10.4284 18.2401 10.378 18.1434 10.378H13.7761C13.3745 10.378 13.0488 10.0524 13.0488 9.65073V7.7535C13.0488 7.2587 12.8749 6.78825 12.5721 6.44915C12.4281 6.28794 12.2615 6.16343 12.0824 6.07923L11.9545 6.02658ZM7.96636 12.4966H5.45455V19.042H7.96636V12.4966Z" fill="white"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M5.29398 20.4966C4.56534 20.4966 4 19.8827 4 19.1539V12.3847C4 11.6559 4.56534 11.042 5.29398 11.042H8.12364L10.8534 4.92738C10.9558 4.69809 11.1677 4.54023 11.4114 4.50434L11.5175 4.49658C12.3273 4.49658 13.0978 4.85402 13.6571 5.48039C14.2015 6.09009 14.5034 6.90649 14.5034 7.7535L14.5027 8.92295L18.1434 8.92346C18.6445 8.92346 19.1173 9.13931 19.4618 9.51188L19.5612 9.62829C19.8955 10.0523 20.0479 10.6054 19.9868 11.1531L19.1398 18.742C19.0297 19.7286 18.2529 20.4966 17.2964 20.4966H8.69422H5.29398ZM11.9545 6.02658L9.41727 11.7111L9.42149 11.7693L9.42091 19.042H17.2964C17.4587 19.042 17.6222 18.8982 17.6784 18.6701L17.6942 18.5807L18.5412 10.9918C18.5604 10.8194 18.5134 10.6486 18.4189 10.5287C18.3398 10.4284 18.2401 10.378 18.1434 10.378H13.7761C13.3745 10.378 13.0488 10.0524 13.0488 9.65073V7.7535C13.0488 7.2587 12.8749 6.78825 12.5721 6.44915C12.4281 6.28794 12.2615 6.16343 12.0824 6.07923L11.9545 6.02658ZM7.96636 12.4966H5.45455V19.042H7.96636V12.4966Z" fill="currentColor"></path></svg>`

export const FeedbackExtension = {
  name: 'Feedback',
  type: 'response',
  match: ({ trace }) =>
    trace.type === 'ext_feedback' || trace.payload?.name === 'ext_feedback',
  render: async ({ trace, element }) => {
    const projectID = localStorage.getItem('vf_project_id')
    if (!projectID) {
      console.error('Project ID not found in localStorage')
      return
    }

    const storageKey = `voiceflow-session-${projectID}`
    let lastUserMessage = ''
    let lastSystemMessage = ''
    let userID = ''

    try {
      // Get session data from local storage
      const sessionData = localStorage.getItem(storageKey)
      if (!sessionData) return

      const parsedData = JSON.parse(sessionData)
      const turns = parsedData.turns
      userID = parsedData.userID
      console.log('userID', userID)
      console.log('turns', turns)

      if (turns.length < 2) return

      // Get last user and system messages
      const lastMessages = turns.slice(-2)
      lastUserMessage =
        lastMessages.find((turn) => turn.type === 'user')?.message || ''
      lastSystemMessage =
        lastMessages.find((turn) => turn.type === 'system')?.messages?.[0]
          ?.text || ''

      if (!lastUserMessage || !lastSystemMessage) return

      // Create feedback UI
      const feedbackContainer = document.createElement('div')
      feedbackContainer.innerHTML = `
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400&display=swap');

          .vfrc-message--extension-Feedback {
            background-color: transparent !important;
            background: none !important;
            display: flex !important;
            justify-content: flex-start !important;
            width: 100% !important;
            position: relative !important;
            left: 0 !important;
            margin-left: 0 !important;
            padding-left: 0 !important;
          }
          .vfrc-feedback {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: -12px;
            margin-bottom: -4px;
            margin-left: 0;
            position: relative;
            z-index: 1;
          }
          /* Add margin when inside a system response that has avatar */
          .vfrc-system-response:has(.vfrc-avatar) .vfrc-feedback {
            margin-left: 30px;
          }

          .vfrc-system-response {
            padding-right: 0 !important;
          }
          .vfrc-feedback--description {
            font-family: 'Open Sans', sans-serif;
            font-size: 0.8em;
            color:rgb(179, 179, 179);
            pointer-events: none;
          }
          .vfrc-feedback--buttons {
            display: flex;
          }
          .vfrc-feedback--button {
            margin: 0;
            padding: 0;
            margin-left: 0px;
            border: none;
            background: none;
            opacity: 0.2;
            cursor: pointer;
          }
          .vfrc-feedback--button:hover {
            opacity: 0.5;
          }
          .vfrc-feedback--button.selected {
            opacity: 0.6;
          }
          .vfrc-feedback--button.disabled {
            pointer-events: none;
          }
          .vfrc-feedback--button:first-child svg {
            fill: none;
            stroke: none;
            border: none;
            margin-left: 6px;
          }
          .vfrc-feedback--button:last-child svg {
            margin-left: 4px;
            fill: none;
            stroke: none;
            border: none;
            transform: rotate(180deg);
          }
          .vfrc-system-response:has(.vfrc-message--extension-Feedback) .vfrc-avatar {
            display: none !important;
          }
        </style>
        <div class="vfrc-feedback">
          <div class="vfrc-feedback--buttons">
            <button class="vfrc-feedback--button" data-feedback="1">${SVG_Thumb}</button>
            <button class="vfrc-feedback--button" data-feedback="-1">${SVG_Thumb}</button>
          </div>
        </div>
      `

      // Find and hide avatar in the last system response
      const parentSystemResponse = element.closest('.vfrc-system-response')
      if (parentSystemResponse) {
        const avatar = parentSystemResponse.querySelector('.vfrc-avatar')
        if (avatar) {
          avatar.style.display = 'none'
        }
      }

      feedbackContainer
        .querySelectorAll('.vfrc-feedback--button')
        .forEach((button) => {
          button.addEventListener('click', async (event) => {
            const score = parseInt(button.getAttribute('data-feedback'))

            try {
              // Send feedback data to our server endpoint
              const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  userID,
                  user: lastUserMessage,
                  system: lastSystemMessage,
                  score: score,
                  projectID: projectID,
                }),
              })

              if (response.ok) {
                console.log('Feedback submitted successfully')
                // Disable buttons and show selection
                feedbackContainer
                  .querySelectorAll('.vfrc-feedback--button')
                  .forEach((btn) => {
                    btn.classList.add('disabled')
                    if (btn === button) {
                      btn.classList.add('selected')
                    }
                  })
              } else {
                console.error('Failed to submit feedback')
              }
            } catch (error) {
              console.error('Error submitting feedback:', error)
            }
          })
        })

      // Append feedback UI to the message
      element.appendChild(feedbackContainer)
    } catch (error) {
      console.error('Error in FeedbackExtension:', error)
    }
  },
}

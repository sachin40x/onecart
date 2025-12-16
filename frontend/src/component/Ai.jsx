import React, { useContext, useState, useEffect, useRef } from 'react'
import ai from "../assets/ai.png"
import { shopDataContext } from '../context/ShopContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import open from "../assets/open.mp3"

function Ai() {
  let {showSearch , setShowSearch} = useContext(shopDataContext)
  let navigate = useNavigate()
  let [activeAi,setActiveAi] = useState(false)
  let [isSupported, setIsSupported] = useState(false)
  let [retryCount, setRetryCount] = useState(0)
  let openingSound = new Audio(open)
  const recognitionRef = useRef(null)
  const maxRetries = 3

  function speak(message){
    let utterance = new SpeechSynthesisUtterance(message)
    utterance.rate = 0.8
    utterance.pitch = 1
    window.speechSynthesis.speak(utterance)
  }

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      setIsSupported(true)
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-US'
      
      // Brave browser specific settings
      if (navigator.userAgent.includes('Brave')) {
        console.log("Brave browser detected - applying specific settings")
        // Brave browser sometimes needs different language settings
        recognitionRef.current.lang = 'en-US'
        // Enable continuous mode for better recognition in Brave
        recognitionRef.current.continuous = true
        // Set interim results for better feedback
        recognitionRef.current.interimResults = true
      }
      
      // Check if we're on HTTPS or localhost
      const isSecureContext = window.isSecureContext || window.location.protocol === 'https:' || window.location.hostname === 'localhost'
      if (!isSecureContext) {
        console.warn("Speech recognition requires HTTPS or localhost")
        toast.warning("Voice recognition requires HTTPS. Please use localhost or deploy with HTTPS.")
      }
    } else {
      console.log("Speech Recognition not supported in this browser")
      toast.error("Voice recognition not supported in your browser")
    }
  }, [])

  const handleVoiceCommand = (transcript) => {
    const command = transcript.toLowerCase().trim();
    console.log("Voice command:", command);
    
    if(command.includes("search") && command.includes("open") && !showSearch){
      speak("opening search")
      setShowSearch(true) 
      navigate("/collection")
    }
    else if(command.includes("search") && command.includes("close") && showSearch){
      speak("closing search")
      setShowSearch(false) 
    }
    else if(command.includes("collection") || command.includes("collections") || command.includes("product") || command.includes("products")){
      speak("opening collection page")
      navigate("/collection")
    }
    else if(command.includes("about") || command.includes("aboutpage")){
      speak("opening about page")
      navigate("/about")
      setShowSearch(false) 
    }
    else if(command.includes("home") || command.includes("homepage")){
      speak("opening home page")
      navigate("/")
      setShowSearch(false) 
    }
    else if(command.includes("cart") || command.includes("kaat") || command.includes("caat")){
      speak("opening your cart")
      navigate("/cart")
      setShowSearch(false) 
    }
    else if(command.includes("contact")){
      speak("opening contact page")
      navigate("/contact")
      setShowSearch(false) 
    }
    else if(command.includes("order") || command.includes("myorders") || command.includes("orders") || command.includes("my order")){
      speak("opening your orders page")
      navigate("/order")
      setShowSearch(false) 
    }
    else{
      speak("Command not recognized. Please try again.")
      toast.error("Command not recognized. Try saying: search, collection, home, cart, about, contact, or orders")
    }
  }

  const startVoiceRecognition = () => {
    if (!isSupported || !recognitionRef.current) {
      toast.error("Voice recognition not supported")
      return
    }

    // Check if we're in a secure context
    const isSecureContext = window.isSecureContext || window.location.protocol === 'https:' || window.location.hostname === 'localhost'
    if (!isSecureContext) {
      toast.error("Voice recognition requires HTTPS or localhost. Please use localhost for development.")
      return
    }

    // Additional debugging for Brave browser
    if (navigator.userAgent.includes('Brave')) {
      console.log("Brave browser detected - checking shields and permissions")
      console.log("Current URL:", window.location.href)
      console.log("Is secure context:", isSecureContext)
      console.log("User agent:", navigator.userAgent)
    }

    try {
      recognitionRef.current.onresult = (e) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const transcript = e.results[i][0].transcript;
          if (e.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        // For Brave browser, we need to handle both final and interim results
        if (finalTranscript) {
          console.log("Final transcript:", finalTranscript);
          handleVoiceCommand(finalTranscript);
        } else if (interimTranscript && navigator.userAgent.includes('Brave')) {
          console.log("Interim transcript:", interimTranscript);
          // For Brave, we can also process interim results
          handleVoiceCommand(interimTranscript);
        }
      }

      recognitionRef.current.onend = () => {
        setActiveAi(false)
      }

      recognitionRef.current.onerror = (e) => {
        console.error("Speech recognition error:", e.error)
        setActiveAi(false)
        
        switch(e.error) {
          case 'not-allowed':
            toast.error("Microphone permission denied. Please allow microphone access and try again.")
            break
          case 'no-speech':
            toast.error("No speech detected. Please speak clearly and try again.")
            break
          case 'network':
            if (navigator.userAgent.includes('Brave')) {
              console.log("Network error in Brave - retry count:", retryCount)
              if (retryCount < maxRetries) {
                setRetryCount(prev => prev + 1)
                toast.warning(`Network error in Brave browser. Retrying... (${retryCount + 1}/${maxRetries})`)
                setTimeout(() => {
                  startVoiceRecognition()
                }, 2000)
              } else {
                toast.error("Network error in Brave browser. Please: 1) Disable shields for this site 2) Check internet connection 3) Try refreshing the page")
                setRetryCount(0)
              }
            } else {
              toast.error("Network error. Please check your internet connection and try again.")
            }
            break
          case 'aborted':
            toast.error("Voice recognition was interrupted. Please try again.")
            break
          case 'audio-capture':
            toast.error("No microphone found. Please connect a microphone and try again.")
            break
          case 'service-not-allowed':
            toast.error("Voice recognition service not allowed. Please check your browser settings.")
            break
          default:
            toast.error(`Voice recognition error: ${e.error}. Please try again.`)
        }
      }

      recognitionRef.current.start()
      openingSound.play()
      setActiveAi(true)
      toast.info("Listening... Speak now!")
      
    } catch (error) {
      console.error("Error starting voice recognition:", error)
      toast.error("Failed to start voice recognition. Please try again.")
    }
  }

  return (
    <div className='fixed lg:bottom-[20px] md:bottom-[40px] bottom-[80px] left-[2%] '>
      <div onClick={startVoiceRecognition}>
        <img src={ai} alt="" className={`w-[100px] cursor-pointer ${activeAi ? 'translate-x-[10%] translate-y-[-10%] scale-125 ' : 'translate-x-[0] translate-y-[0] scale-100'} transition-transform` } style={{
          filter: ` ${activeAi?"drop-shadow(0px 0px 30px #00d2fc)":"drop-shadow(0px 0px 20px black)"}`
        }}/>
      </div>
      {navigator.userAgent.includes('Brave') && (
        <div className="mt-2 text-xs text-white bg-gray-800 p-2 rounded opacity-80">
          <div>Brave Browser Tips:</div>
          <div>1. Disable shields for this site</div>
          <div>2. Allow microphone access</div>
          <div>3. Check internet connection</div>
        </div>
      )}
    </div>
  )
}

export default Ai
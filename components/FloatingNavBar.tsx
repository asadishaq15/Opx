'use client'

import React, { useRef, useState } from "react"
import styled, { keyframes } from "styled-components"

// Wavy animation for smooth flowing line
const wave = keyframes`
  0% { d: path("M0 10 Q 10 0 20 10 T 40 10 T 60 10 T 80 10"); }
  50% { d: path("M0 10 Q 10 20 20 10 T 40 10 T 60 10 T 80 10"); }
  100% { d: path("M0 10 Q 10 0 20 10 T 40 10 T 60 10 T 80 10"); }
`

const Container = styled.div`
  position: fixed;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0);
  backdrop-filter: blur(10px);
  border-radius: 1.5rem;
  padding: 0.5rem 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: 100;
  border: 1px solid rgba(136, 136, 136, 0.2);

  /* Glass effect for 3D look */
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(136, 136, 136, 0.1);

  /* Responsive adjustments */
  @media (min-width: 640px) {
    top: 1.5rem;
    right: 1.5rem;
    border-radius: 2rem;
    padding: 0.6rem 1.2rem;
    gap: 1rem;
  }

  @media (max-width: 480px) {
    top: 0.75rem;
    right: 0.75rem;
    padding: 0.4rem 0.6rem;
    gap: 0.3rem;
    border-radius: 1.25rem;
  }
`

interface WaveContainerProps {
  playing: number
}

const WaveContainer = styled.svg<WaveContainerProps>`
  width: 60px;
  height: 15px;
  cursor: pointer;
  path {
    fill: none;
    stroke: #888;
    stroke-width: 2;
    animation: ${wave} 2s ease-in-out infinite;
    animation-play-state: ${(props) => (props.playing ? "running" : "paused")};
  }

  /* Glass effect for 3D look */
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));

  /* Responsive adjustments */
  @media (min-width: 640px) {
    width: 80px;
    height: 20px;
  }

  @media (max-width: 480px) {
    width: 50px;
    height: 12px;
  }
`

interface ModalProps {
  isOpen: string | null
  onClose: () => void
  children: React.ReactNode
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-gray-900 p-6 rounded-lg max-w-md w-full" onClick={e => e.stopPropagation()}>
          {children}
        </div>
      </div>
    </div>
  )
}

interface ContactModalProps {
  onClose: () => void
}

const ContactModal: React.FC<ContactModalProps> = ({ onClose }) => {
  return (
    <div className="text-white">
      <h2 className="text-xl font-bold mb-4">Contact Us</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Name</label>
          <input 
            type="text" 
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
            placeholder="Your name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input 
            type="email" 
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white"
            placeholder="Your email"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Message</label>
          <textarea 
            className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white h-24"
            placeholder="Your message"
          />
        </div>
        <div className="flex gap-2 pt-4">
          <button 
            className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-500 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500 transition-colors"
            onClick={onClose}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

const FloatingNavBar: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [modalContent, setModalContent] = useState<string | null>(null)

  const toggleAudio = () => {
    setPlaying((prev) => {
      if (!prev && audioRef.current) {
        audioRef.current.play()
      } else if (audioRef.current) {
        audioRef.current.pause()
      }
      return !prev
    })
  }

  const openModal = (type: string) => setModalContent(type)
  const closeModal = () => setModalContent(null)

  return (
    <>
      <Container>
        <a
          className="rounded-full text-bold hover:bg-gray-300 cursor-pointer px-2 sm:px-3 py-1 text-xs sm:text-sm text-[#888] hover:text-white transition-all duration-300"
          href="#layer2"
          style={{
            filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
          }}
        >
          <span className="hidden sm:inline">Work</span>
          <span className="sm:hidden">W</span>
        </a>

        <WaveContainer
          viewBox="0 0 80 20"
          onClick={toggleAudio}
          playing={playing ? 1 : 0}
        >
          <path d="M0 10 Q 10 0 20 10 T 40 10 T 60 10 T 80 10" />
        </WaveContainer>

        <button
          className="rounded-full text-bold cursor-pointer px-2 sm:px-3 py-1 text-xs sm:text-sm text-white bg-gray-500 hover:bg-[#888] transition-all duration-300"
          onClick={() => openModal("contact")}
          style={{
            filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))",
          }}
        >
          <span className="hidden sm:inline">Contact</span>
          <span className="sm:hidden">C</span>
        </button>

        <audio ref={audioRef} src="/assets/fake_verthandi.mp3" loop />
      </Container>

      <Modal isOpen={modalContent} onClose={closeModal}>
        {modalContent === "contact" && <ContactModal onClose={closeModal} />}
      </Modal>
    </>
  )
}

export default FloatingNavBar
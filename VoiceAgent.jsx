import React from 'react';

const VoiceAgent = () => {
    return (
        <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end pointer-events-none">
            {/* Helper Text Message - visible above the widget */}
            <div className="bg-white px-4 py-2 rounded-xl shadow-lg border border-gray-100 mb-4 animate-fade-in pointer-events-auto mr-2">
                <p className="text-sm max-w-64 font-medium text-gray-800">
                    मदद चाहिए?
                </p>
                {/* Triangle pointer */}
                <div className="absolute bottom-[-6px] right-8 w-3 h-3 bg-white border-b border-r border-gray-100 transform rotate-45"></div>
            </div>

            {/* ElevenLabs Widget Container - The widget itself handles the launcher, but we place the tag here */}
            <div className="pointer-events-auto">
                <elevenlabs-convai agent-id="agent_8301kf5mtbjmegq85x7x80grgm4b"></elevenlabs-convai>
            </div>
        </div>
    );
};

export default VoiceAgent;

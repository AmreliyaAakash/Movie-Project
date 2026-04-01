import React from 'react';

const BlurLoader = ({ text = "Processing..." }) => {

    React.useEffect(() => {
        const blockEvent = (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return false;
        };

        // Attach listeners to window in Capture phase to intercept EVERYTHING
        window.addEventListener('click', blockEvent, true);
        window.addEventListener('mousedown', blockEvent, true);
        window.addEventListener('mouseup', blockEvent, true);
        window.addEventListener('keydown', blockEvent, true);
        window.addEventListener('touchstart', blockEvent, true);

        return () => {
            window.removeEventListener('click', blockEvent, true);
            window.removeEventListener('mousedown', blockEvent, true);
            window.removeEventListener('mouseup', blockEvent, true);
            window.removeEventListener('keydown', blockEvent, true);
            window.removeEventListener('touchstart', blockEvent, true);
        };
    }, []);

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center animate-fadeIn cursor-wait"
            style={{ zIndex: 2147483647, pointerEvents: 'auto' }} // Max Z-Index
        >
            <div className="relative">
                {/* Outer Ring */}
                <div className="w-16 h-16 border-4 border-[#ff3366]/30 border-t-[#ff3366] rounded-full animate-spin"></div>
                {/* Inner Ring */}
                <div className="absolute top-2 left-2 w-12 h-12 border-4 border-white/20 border-b-white rounded-full animate-spin-reverse"></div>
            </div>
            <p className="mt-4 text-white font-bold text-lg tracking-wider animate-pulse">{text}</p>
        </div>
    );
};

export default BlurLoader;





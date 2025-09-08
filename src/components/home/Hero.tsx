import Image from 'next/image';

export default function Hero() {
  return (
    <div className="min-h-screen bg-white">
      
      {/* Brand Overview Section */}
      <section className="py-16">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            
            {/* Left: School Info */}
            <div>
              {/* <div className="flex items-start space-x-4 mb-8">
                <Image 
                  src="/logo.png" 
                  alt="St. Joseph's Central Academy Logo"
                  width={80}
                  height={80}
                  className="object-contain"
                />
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-school-primary-red mb-2">
                    ST. JOSEPH'S CENTRAL ACADEMY
                  </h1>
                  <h2 className="text-xl md:text-2xl font-medium text-school-primary-blue mb-3">
                    SIRONOI
                  </h2>
                  <p className="text-lg text-gray-700 font-medium">
                    A Good Academic Foundation for a Brighter Future
                  </p>
                </div>
              </div> */}
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-school-primary-red mb-3">Typography Examples</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-2xl font-bold text-school-primary-red">Primary Heading Style</h4>
                      <p className="text-school-primary-blue">With blue accent text</p>
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-school-primary-blue">Secondary Blue Style</h4>
                      <p className="text-gray-700">With regular body text</p>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-school-primary-red uppercase tracking-wide">Uppercase Style</h4>
                      <p className="text-sm text-gray-600">For labels and categories</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Brand Colors */}
            <div>
              <h3 className="text-xl font-semibold text-school-primary-red mb-6">Brand Colors</h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-school-primary-red rounded-md shadow-sm"></div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Primary Red</h4>
                    <p className="text-sm text-gray-600">#720026</p>
                    <p className="text-xs text-gray-500">Headers, buttons, primary elements</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-school-primary-blue rounded-md shadow-sm"></div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Primary Blue</h4>
                    <p className="text-sm text-gray-600">#88ccf1</p>
                    <p className="text-xs text-gray-500">Accents, secondary text</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-school-primary-lightBlue rounded-md shadow-sm"></div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Light Blue</h4>
                    <p className="text-sm text-gray-600">#97D2FB</p>
                    <p className="text-xs text-gray-500">Highlights, hover states</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-school-primary-white border-2 border-gray-200 rounded-md shadow-sm"></div>
                  <div>
                    <h4 className="font-semibold text-gray-800">White</h4>
                    <p className="text-sm text-gray-600">#FFFFFC</p>
                    <p className="text-xs text-gray-500">Backgrounds, content areas</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-school-primary-black rounded-md shadow-sm"></div>
                  <div>
                    <h4 className="font-semibold text-gray-800">Black</h4>
                    <p className="text-sm text-gray-600">#000000</p>
                    <p className="text-xs text-gray-500">Text, borders, icons</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Color Combinations Examples */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-xl font-semibold text-school-primary-red mb-8">Color Combinations in Use</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Red Primary */}
            <div className="bg-school-primary-red text-white p-6 rounded-lg">
              <h4 className="text-lg font-bold mb-2">Red Background</h4>
              <p className="text-school-primary-lightBlue mb-3">Light blue accent text</p>
              <p className="text-sm">Perfect for call-to-action sections and important announcements.</p>
            </div>
            
            {/* Blue Primary */}
            <div className="bg-school-primary-blue text-school-primary-red p-6 rounded-lg">
              <h4 className="text-lg font-bold mb-2">Blue Background</h4>
              <p className="text-school-primary-red/80 mb-3">Red accent text</p>
              <p className="text-sm text-school-primary-red">Great for information sections and secondary content.</p>
            </div>
            
            {/* White Clean */}
            <div className="bg-white border-2 border-school-primary-lightBlue p-6 rounded-lg">
              <h4 className="text-lg font-bold text-school-primary-red mb-2">White Background</h4>
              <p className="text-school-primary-blue mb-3">Blue accent elements</p>
              <p className="text-sm text-gray-700">Standard for most content areas and forms.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Button Styles */}
      <section className="py-16">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-xl font-semibold text-school-primary-red mb-8">Button Styles</h3>
          
          <div className="flex flex-wrap gap-4">
            <button className="px-6 py-3 bg-school-primary-red text-white font-medium rounded-md hover:bg-school-primary-red/90 transition-colors">
              Primary Button
            </button>
            <button className="px-6 py-3 bg-school-primary-blue text-school-primary-red font-medium rounded-md hover:bg-school-primary-lightBlue transition-colors">
              Secondary Button
            </button>
            <button className="px-6 py-3 border-2 border-school-primary-red text-school-primary-red font-medium rounded-md hover:bg-school-primary-red hover:text-white transition-colors">
              Outline Button
            </button>
            <button className="px-6 py-3 text-school-primary-blue font-medium hover:text-school-primary-red transition-colors">
              Text Button
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
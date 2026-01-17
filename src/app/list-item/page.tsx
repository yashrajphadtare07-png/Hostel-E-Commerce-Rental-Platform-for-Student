"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Image from 'next/image';
import { 
  Camera, 
  ChevronRight, 
  ChevronLeft, 
  Upload, 
  Check, 
  AlertCircle,
  Loader2,
  Package,
  IndianRupee,
  MapPin,
  Tag,
  Calendar,
  Sparkles,
  Wand2,
  Brain
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import Navbar from "@/components/sections/navbar";
import Footer from "@/components/sections/footer";
import { auth, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { generateItemDescription, suggestPrice, verifyItemImage } from '@/lib/gemini';
import { onAuthStateChanged } from 'firebase/auth';
import { supabase } from '@/lib/supabase';

const STEPS = [
  { id: 1, title: 'Photos', icon: Camera },
  { id: 2, title: 'AI Magic', icon: Wand2 },
  { id: 3, title: 'Details', icon: Tag },
  { id: 4, title: 'Review', icon: Check }
];

const CATEGORIES = ["Electronics", "Books", "Sports", "Furniture", "Appliances", "Clothing", "Vehicles", "Study Materials", "Musical Instruments", "Other"];
const TARGET_YEARS = ["All Years", "First Year", "Second Year", "Third Year", "Fourth Year"];
const COLLEGES = [
  "Savitribai Phule Pune University (SPPU)",
  "COEP Technological University",
  "Pune Institute of Computer Technology (PICT)",
  "VIT Pune",
  "MIT World Peace University",
  "Fergusson College"
];
const CONDITIONS = ["Like New", "Good", "Fair", "Worn"];

export default function ListItemPage() {
  const [user, setUser] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [priceLoading, setPriceLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [imageVerification, setImageVerification] = useState<{
    isValid: boolean;
    confidence: number;
    detectedCategory: string;
    issues: string[];
  } | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Other',
    condition: 'Good',
    price_per_day: '',
    target_year: 'All Years',
    college: '',
    location: '',
    image: null as File | null,
    imagePreview: '',
    tags: [] as string[]
  });

  const [priceHint, setPriceHint] = useState<{
    min: number;
    max: number;
    recommended: number;
    reasoning: string;
  } | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        const fetchProfile = async () => {
          const { data } = await supabase.from('profiles').select('college').eq('id', user.uid).single();
          if (data?.college) {
            setFormData(prev => ({ ...prev, college: data.college }));
          }
        };
        fetchProfile();
      } else {
        window.location.href = '/login';
      }
    });
    return () => unsubscribe();
  }, []);

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFormData({
        ...formData,
        image: file,
        imagePreview: URL.createObjectURL(file)
      });
      setAiGenerated(false);
      setImageVerification(null);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1
  });

  const handleAiGenerate = async () => {
    if (!formData.image) {
      toast.error("Please upload an image first");
      return;
    }
    
    setAiLoading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const mimeType = formData.image!.type;
        
        try {
          const result = await generateItemDescription(base64, mimeType);
          
          setFormData(prev => ({
            ...prev,
            title: result.title,
            description: result.description,
            category: CATEGORIES.includes(result.category) ? result.category : "Other",
            condition: CONDITIONS.includes(result.condition) ? result.condition : "Good",
            price_per_day: result.suggestedPrice.perDay.toString(),
            tags: result.tags
          }));
          
          setPriceHint({
            min: result.suggestedPrice.min,
            max: result.suggestedPrice.max,
            recommended: result.suggestedPrice.perDay,
            reasoning: "AI analyzed the image and suggested pricing based on item type and condition."
          });
          
          setAiGenerated(true);
          toast.success("AI generated listing details from your image!");
        } catch (err: any) {
          if (err.message === "QUOTA_EXCEEDED") {
            toast.error("AI service is busy. Please fill in the details manually.");
            setCurrentStep(3); // Skip to manual entry
          } else {
            throw err;
          }
        }
      };
      reader.readAsDataURL(formData.image);
    } catch (error) {
      console.error(error);
      toast.error("Failed to analyze image. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleVerifyImage = async () => {
    if (!formData.image || !formData.category) {
      toast.error("Please upload an image and select a category first");
      return;
    }
    
    setVerifyLoading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const mimeType = formData.image!.type;
        
        try {
          const result = await verifyItemImage(base64, mimeType, formData.category);
          setImageVerification(result);
          
          if (result.isValid) {
            toast.success(`Image verified! ${result.confidence}% match for ${result.detectedCategory}`);
          } else {
            toast.warning(`Image may not match. Detected: ${result.detectedCategory}`);
          }
        } catch (err: any) {
          if (err.message === "QUOTA_EXCEEDED") {
            toast.error("Image verification currently unavailable.");
          } else {
            throw err;
          }
        }
      };
      reader.readAsDataURL(formData.image);
    } catch (error) {
      console.error(error);
      toast.error("Failed to verify image");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleGetPriceSuggestion = async () => {
    if (!formData.title || !formData.category || !formData.condition) {
      toast.error("Please fill in title, category, and condition first");
      return;
    }
    
    setPriceLoading(true);
    try {
      const result = await suggestPrice(formData.title, formData.category, formData.condition);
      setPriceHint(result);
      setFormData(prev => ({ ...prev, price_per_day: result.recommended.toString() }));
      toast.success("AI suggested a fair price!");
    } catch (error: any) {
      console.error(error);
      if (error.message === "QUOTA_EXCEEDED") {
        toast.error("Price suggestion service is busy. Please set price manually.");
      } else {
        toast.error("Failed to get price suggestion");
      }
    } finally {
      setPriceLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.image) {
        toast.error("Please upload an image of the item");
        return;
      }
    }
    if (currentStep === 3) {
      if (!formData.title || !formData.description || !formData.price_per_day || !formData.college) {
        toast.error("Please fill in all required details");
        return;
      }
    }
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => setCurrentStep(prev => prev - 1);

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);
    try {
      let imageUrl = '';
      
      if (formData.image) {
        const fileExt = formData.image.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const storageRef = ref(storage, `items/${user.uid}/${fileName}`);
        
        await uploadBytes(storageRef, formData.image);
        imageUrl = await getDownloadURL(storageRef);
      }

      const { error: dbError } = await supabase
        .from('items')
        .insert({
          owner_id: user.uid,
          title: formData.title,
          description: formData.description,
          price_per_day: parseFloat(formData.price_per_day),
          category: formData.category,
          image_url: imageUrl,
          location: formData.location || 'Hostel Campus',
          college: formData.college,
          target_year: formData.target_year,
          trust_level: 'Verified',
          rating: 5,
          reviews: 0,
          condition: formData.condition,
          tags: formData.tags
        });

      if (dbError) throw dbError;

      setSuccess(true);
      toast.success("Item listed successfully!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="min-h-screen bg-[#0a0a0a]">
        <Navbar />
        <div className="pt-32 pb-20 px-4 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-white/5 border border-white/10 rounded-3xl p-8 text-center"
          >
            <div className="w-20 h-20 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">Item Listed Successfully!</h1>
            <p className="text-white/60 mb-8">
              Your item is now live and visible to students in your college. You'll receive a notification when someone requests to rent it.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/browse"
                className="px-8 py-3 bg-white/10 hover:bg-white/15 text-white font-medium rounded-xl transition-all"
              >
                View Listings
              </a>
              <button 
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold rounded-xl hover:shadow-[0_0_20px_rgba(251,191,36,0.3)] transition-all"
              >
                List Another Item
              </button>
            </div>
          </motion.div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      
      <div className="pt-32 pb-20 px-4 max-w-4xl mx-auto">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-black" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">AI-Powered Listing</h1>
              <p className="text-white/50">Upload a photo and let AI do the magic</p>
            </div>
          </div>
        </div>

        <div className="mb-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2" />
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-amber-400 to-orange-500 -translate-y-1/2 transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
          />
          <div className="relative flex justify-between">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep >= step.id;
              return (
                <div key={step.id} className="flex flex-col items-center">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 z-10 ${
                      isActive 
                        ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-black shadow-[0_0_15px_rgba(251,191,36,0.4)]' 
                        : 'bg-[#1a1a1a] text-white/30 border border-white/5'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-xs mt-2 font-medium ${isActive ? 'text-amber-400' : 'text-white/30'}`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-10 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Upload Your Item Photo</h2>
                  <p className="text-white/50">Our AI will analyze the image and generate listing details automatically</p>
                </div>
                
                <div 
                  {...getRootProps()} 
                  className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all cursor-pointer min-h-[300px] flex flex-col items-center justify-center ${
                    isDragActive ? 'border-amber-400 bg-amber-400/5' : 'border-white/10 hover:border-white/20 bg-white/5'
                  }`}
                >
                  <input {...getInputProps()} />
                  {formData.imagePreview ? (
                    <div className="relative w-full aspect-video rounded-2xl overflow-hidden group">
                      <Image 
                        src={formData.imagePreview} 
                        alt="Preview" 
                        fill 
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                        <p className="text-white font-medium flex items-center gap-2">
                          <Upload className="w-5 h-5" /> Change Image
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-3xl flex items-center justify-center mx-auto border border-amber-400/30">
                        <Camera className="w-10 h-10 text-amber-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-lg">Click or drag an image here</p>
                        <p className="text-white/40 text-sm mt-1">PNG, JPG or WEBP (Max 5MB)</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-amber-400/10 border border-amber-400/20 rounded-2xl text-amber-400 text-sm">
                  <Sparkles className="w-5 h-5 shrink-0" />
                  <span>Upload a clear photo and our AI will automatically fill in the title, description, category, and suggested price!</span>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">AI Magic</h2>
                  <p className="text-white/50">Let our AI analyze your image and generate listing details</p>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-1/3">
                    <div className="aspect-square relative rounded-2xl overflow-hidden border border-white/10">
                      {formData.imagePreview && (
                        <Image 
                          src={formData.imagePreview} 
                          alt="Item preview" 
                          fill 
                          className="object-cover"
                        />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <button
                      onClick={handleAiGenerate}
                      disabled={aiLoading}
                      className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold rounded-2xl hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all disabled:opacity-50"
                    >
                      {aiLoading ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          Analyzing Image...
                        </>
                      ) : (
                        <>
                          <Wand2 className="w-6 h-6" />
                          Generate with AI
                        </>
                      )}
                    </button>

                    {aiGenerated && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl">
                          <div className="flex items-center gap-2 text-green-400 mb-2">
                            <Check className="w-5 h-5" />
                            <span className="font-bold">AI Generated Successfully!</span>
                          </div>
                          <div className="space-y-2 text-sm">
                            <p className="text-white"><span className="text-white/50">Title:</span> {formData.title}</p>
                            <p className="text-white"><span className="text-white/50">Category:</span> {formData.category}</p>
                            <p className="text-white"><span className="text-white/50">Condition:</span> {formData.condition}</p>
                            <p className="text-white"><span className="text-white/50">Suggested Price:</span> ₹{formData.price_per_day}/day</p>
                          </div>
                        </div>

                        <button
                          onClick={handleVerifyImage}
                          disabled={verifyLoading}
                          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border border-white/10 text-white/80 font-medium rounded-xl hover:bg-white/10 transition-all disabled:opacity-50"
                        >
                          {verifyLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4" />
                          )}
                          Verify Image Match
                        </button>

                        {imageVerification && (
                          <div className={`p-4 rounded-2xl border ${imageVerification.isValid ? 'bg-green-500/10 border-green-500/20' : 'bg-yellow-500/10 border-yellow-500/20'}`}>
                            <div className="flex items-center justify-between mb-2">
                              <span className={`font-bold ${imageVerification.isValid ? 'text-green-400' : 'text-yellow-400'}`}>
                                {imageVerification.isValid ? 'Image Verified' : 'Verification Warning'}
                              </span>
                              <span className="text-white/60 text-sm">{imageVerification.confidence}% confidence</span>
                            </div>
                            <p className="text-white/70 text-sm">Detected: {imageVerification.detectedCategory}</p>
                            {imageVerification.issues.length > 0 && (
                              <ul className="mt-2 text-sm text-yellow-400/80">
                                {imageVerification.issues.map((issue, i) => (
                                  <li key={i}>• {issue}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                      </motion.div>
                    )}

                    {!aiGenerated && (
                      <div className="p-4 bg-white/5 border border-white/10 rounded-2xl text-center">
                        <Brain className="w-12 h-12 text-white/20 mx-auto mb-3" />
                        <p className="text-white/40 text-sm mb-4">Click "Generate with AI" to auto-fill your listing details</p>
                        <button
                          onClick={() => setCurrentStep(3)}
                          className="text-amber-400/70 hover:text-amber-400 text-sm underline underline-offset-2 transition-colors"
                        >
                          Or skip and fill details manually
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Confirm Details</h2>
                  <p className="text-white/50">Review and adjust the AI-generated details</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/60 flex items-center gap-2">
                      <Tag className="w-4 h-4" /> Item Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g. Engineering Mathematics Textbook"
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-amber-400/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/60 flex items-center gap-2">
                      <Package className="w-4 h-4" /> Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-amber-400/50 appearance-none cursor-pointer"
                    >
                      {CATEGORIES.map(cat => <option key={cat} value={cat} className="bg-[#1a1a1a]">{cat}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/60">Description</label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe the item condition, any rules, and what's included..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-amber-400/50 transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/60">Condition</label>
                    <select
                      value={formData.condition}
                      onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-amber-400/50 appearance-none cursor-pointer"
                    >
                      {CONDITIONS.map(cond => <option key={cond} value={cond} className="bg-[#1a1a1a]">{cond}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/60 flex items-center gap-2">
                      <IndianRupee className="w-4 h-4" /> Price / Day
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.price_per_day}
                        onChange={(e) => setFormData({ ...formData, price_per_day: e.target.value })}
                        placeholder="e.g. 50"
                        className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 pr-20 text-white focus:outline-none focus:border-amber-400/50 transition-all"
                      />
                      <button
                        type="button"
                        onClick={handleGetPriceSuggestion}
                        disabled={priceLoading}
                        className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-amber-400/10 text-amber-400 rounded-lg text-xs font-bold hover:bg-amber-400/20 transition-all"
                      >
                        {priceLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'AI'}
                      </button>
                    </div>
                    {priceHint && (
                      <p className="text-xs text-white/40">Suggested: ₹{priceHint.min} - ₹{priceHint.max}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/60 flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Target Year
                    </label>
                    <select
                      value={formData.target_year}
                      onChange={(e) => setFormData({ ...formData, target_year: e.target.value })}
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-amber-400/50 appearance-none cursor-pointer"
                    >
                      {TARGET_YEARS.map(year => <option key={year} value={year} className="bg-[#1a1a1a]">{year}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/60 flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> College
                    </label>
                    <select
                      value={formData.college}
                      onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-amber-400/50 appearance-none cursor-pointer"
                    >
                      <option value="" disabled className="bg-[#1a1a1a]">Select your college</option>
                      {COLLEGES.map(college => <option key={college} value={college} className="bg-[#1a1a1a]">{college}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/60 flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> Pickup Location (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g. Hostel A, Room 304"
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-white focus:outline-none focus:border-amber-400/50 transition-all"
                    />
                  </div>
                </div>

                {formData.tags.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/60">AI-Generated Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, i) => (
                        <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-sm text-white/70">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Review Your Listing</h2>
                  <p className="text-white/50">Make sure everything looks good before publishing</p>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                  <div className="w-full md:w-1/3">
                    <div className="aspect-square relative rounded-2xl overflow-hidden border border-white/10">
                      {formData.imagePreview && (
                        <Image 
                          src={formData.imagePreview} 
                          alt="Item preview" 
                          fill 
                          className="object-cover"
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold text-white">{formData.title}</h3>
                      <p className="text-amber-400 font-bold mt-1 text-xl">₹{formData.price_per_day}/day</p>
                    </div>
                    <p className="text-white/60 text-sm leading-relaxed">{formData.description}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                        <p className="text-xs text-white/40 uppercase font-bold tracking-wider">Category</p>
                        <p className="text-white text-sm mt-1">{formData.category}</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                        <p className="text-xs text-white/40 uppercase font-bold tracking-wider">Condition</p>
                        <p className="text-white text-sm mt-1">{formData.condition}</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                        <p className="text-xs text-white/40 uppercase font-bold tracking-wider">Target Year</p>
                        <p className="text-white text-sm mt-1">{formData.target_year}</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                        <p className="text-xs text-white/40 uppercase font-bold tracking-wider">College</p>
                        <p className="text-white text-sm mt-1 truncate">{formData.college}</p>
                      </div>
                    </div>
                    {formData.location && (
                      <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                        <p className="text-xs text-white/40 uppercase font-bold tracking-wider">Pickup Location</p>
                        <p className="text-white text-sm mt-1">{formData.location}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                  <p className="text-blue-400 text-sm">
                    By listing this item, you agree to CampusRent's terms and confirm that you own this item.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between mt-10 pt-10 border-t border-white/10">
            <button
              onClick={prevStep}
              disabled={currentStep === 1 || loading}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                currentStep === 1 
                  ? 'opacity-0 pointer-events-none' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <ChevronLeft className="w-5 h-5" /> Back
            </button>

            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-8 py-3 bg-white/10 hover:bg-white/15 text-white font-medium rounded-xl transition-all"
              >
                Next Step <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-10 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-black font-bold rounded-xl hover:shadow-[0_0_20px_rgba(251,191,36,0.3)] transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm & List Item'}
              </button>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </main>
  );
}

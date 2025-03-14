import React, { useState, useEffect } from 'react';
import { Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DealCardProps {
  imageUrl: string;
  name: string;
  discount: number;
  dealId: number;
  createdAt: number;
  categoryId : string;
  productName : string;
  productId : number;
  onDeleteDeal: (id: number) => void;
}

const DealCard: React.FC<DealCardProps> = ({ 
  imageUrl, 
  name, 
  discount,
  dealId,
  createdAt,
  categoryId,
  productName,
  productId,
  onDeleteDeal 
}) => {
  const [timeLeft, setTimeLeft] = useState('');
  const navigate = useNavigate();

  const buyNow = () => {
    window.scrollTo(0, 0);
    navigate(`/product-details/${categoryId}/${productName}/${productId}`);
  }

  useEffect(() => {
    const calculateTimeLeft = () => {
      const dealTime = new Date(createdAt).getTime();
      const expiryTime = dealTime + (24 * 60 * 60 * 1000); // 24 hours in milliseconds
      const now = new Date().getTime();
      const difference = expiryTime - now;

      if (difference <= 0) {
        onDeleteDeal(dealId);
        return '00:00:00';
      }

      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [createdAt, dealId, onDeleteDeal]);

  return (
    <div className="w-[18rem] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 bg-gradient-to-br from-white to-purple-50">
      <div className="relative w-full h-48 overflow-hidden group">
        <img
          src={imageUrl || "/api/placeholder/400/320"}
          alt={name}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-red-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full font-bold shadow-lg animate-pulse">
          -{discount}%
        </div>
      </div>
      
      <div className="p-5 space-y-3">
        <p className="text-xl font-bold bg-gradient-to-r from-black to-pink-600 bg-clip-text text-transparent">
          {name}
        </p>
        
        <div className="flex items-center justify-center p-2 rounded-lg bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 animate-gradient">
          <Flame className="w-5 h-5 text-white animate-bounce mr-2" />
          <span className="font-bold text-white tracking-wider">
            {timeLeft}
          </span>
        </div>

        <button onClick={buyNow} className="w-full py-2 rounded-lg font-bold text-white bg-gradient-to-r from-red-500 to-purple-600/30 hover:from-purple-600/30 hover:to-red-500 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
          MUA NGAY
        </button>
      </div>
    </div>
  );
};

export default DealCard;
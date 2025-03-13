import React, { useEffect } from 'react'
import { HomeCategoryType } from '../../../../types/HomeCategoryType'
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../../state/Store';
import { getProducts } from '../../../../state/customer/ProductCustomerSlice';

const ShopByCategoryCard = ({ category } : { category : HomeCategoryType}) => {
  const dispatch = useAppDispatch();
  const {products} = useAppSelector((state) => state.product);

  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);
  const navigate = useNavigate();

  const numProducts = products.filter((product) => product.category.categoryId === category.categoryId).length;
  
  return (
    <div className='w-80 flex flex-col items-center p-4 bg-white rounded-xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer group'>
      <div onClick={() => navigate(`/products/${category.categoryId}`)} className="w-64 h-64 overflow-hidden rounded-lg">
        <img 
          src={category.image} 
          alt={category.name} 
          className="w-full h-full object-cover"
        />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-800 group-hover:text-[#3f51b5]">
        {category.name}
      </h3>
      <p className="mt-1 text-sm text-gray-500">
        {numProducts} sản phẩm
      </p>
    </div>
  )
}

export default ShopByCategoryCard
import React from 'react'
import { sp1Category2 } from '../../../data/category/level2/sp1Category2'
import { sp3Category2 } from '../../../data/category/level2/sp3Category2'
import { sp2Category2 } from '../../../data/category/level2/sp2Category2'
import { sp4Category2 } from '../../../data/category/level2/sp4Category2'
import { sp1Category3 } from '../../../data/category/level3/sp1Category3'
import { sp2Category3 } from '../../../data/category/level3/sp2Category3'
import { sp3Category3 } from '../../../data/category/level3/sp3Category3'
import { sp4Category3 } from '../../../data/category/level3/sp4Category3'
import { Box } from '@mui/material'
import {useNavigate} from "react-router-dom";

const CategoryTwo: {[key:string] : any[]} = {
    Sanpham1:sp1Category2,
    Sanpham2:sp2Category2,
    Sanpham3:sp3Category2,
    Sanpham4:sp4Category2,
}

const CategoryThree: {[key:string] : any[]} = {
    Sanpham1: sp1Category3,
    Sanpham2: sp2Category3,
    Sanpham3: sp3Category3,
    Sanpham4: sp4Category3,
}

const CategorySheet = ({selectedCategory, setShowSheet}:any) => {
    const childCategory = (category : any, parentCategoryId: any) => {
        return category.filter((child : any) => child.parentCategoryId === parentCategoryId);
    }

    const navigate=useNavigate();
  return (
    <div>
        <Box sx={{zIndex: 2}}>
        <div className='bg-white shadow-lg overflow-y-auto lg:h-[500px]'>
         <div className='flex flex-wrap text-sm h-full'>
        {
            CategoryTwo[selectedCategory]?.map((item,index) => (
                <div className={`p-8 lg:w-[20%] h-full ${index % 2 === 0 ? 'bg-slate-50' : 'bg-white'}`}>
                    <p className='text-primary-color mb-5 font-semibold'>{item.name}</p>
                    <ul className="space-y-3 overflow-y-auto">
                        {
                            childCategory(CategoryThree[selectedCategory], item.categoryId).map((item: any) => (
                                <div>
                                    <li 
                                        onClick={() => {
                                            navigate(`/products/${item.categoryId}`);
                                        }} 
                                        className='hover:text-primary-color cursor-pointer'
                                        >
                                        {item.name}
                                        </li>
                                </div>
                            ))
                        }
                    </ul>
                </div>
            ))
        }
    </div>
    </div>
        </Box>
    </div>
  )
}

export default CategorySheet
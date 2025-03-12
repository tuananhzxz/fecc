import React, { useEffect, useState } from 'react'
import ProductCard from './ProductCard'
import FilterSection from './FilterSection'
import { Box, Divider, FormControl, IconButton, InputLabel, MenuItem, Pagination, Select, SelectChangeEvent, useTheme } from '@mui/material'
import { FilterAlt } from '@mui/icons-material'
import { useParams, useSearchParams } from 'react-router-dom'
import {sortOptions} from "../../../data/filter/sort";
import { useAppDispatch, useAppSelector } from '../../../state/Store'
import { getAllProducts, isColorMatched, ProductParams } from '../../../state/customer/ProductCustomerSlice'
import { Product as ProductCus } from '../../../state/customer/ProductCustomerSlice';

const Product = () => {
    const { category } = useParams();
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const isLargeScreen = theme.breakpoints.up('lg');
    const [searchParam, setSearchParam] = useSearchParams();
    const { products: allProducts, totalPages, loading } = useAppSelector(state => state.product);
    const [sort, setSort] = useState<string>('');
    const [filteredProducts, setFilteredProducts] = useState<ProductCus[]>([]);

    useEffect(() => {        
        const params: ProductParams = {
            category: category || searchParam.get('category') || undefined,
            minPrice: searchParam.get('price') ? 
                Number(searchParam.get('price')?.split('-')[0] || 0) : 
                undefined,
            maxPrice: searchParam.get('price') ? 
                Number(searchParam.get('price')?.split('-')[1] || 0) : 
                undefined,
            minDiscount: searchParam.get('discount') ? 
                Number(searchParam.get('discount')) : 
                undefined,
            sort: searchParam.get('sort') || undefined,
            pageNumber: searchParam.get('page') ? 
                Number(searchParam.get('page')) - 1 : 
                0
        };
        
        dispatch(getAllProducts(params));
    }, [dispatch, searchParam, category]);

    useEffect(() => {
        const colorParam = searchParam.get('color');
        
        if (colorParam && allProducts.length > 0) {
            const filtered = allProducts.filter((product: ProductCus) => 
                isColorMatched(product.color, colorParam)
            );
            setFilteredProducts(filtered);
        } else {
            setFilteredProducts(allProducts);
        }
    }, [allProducts, searchParam]);

    const handleSortChange = (event: SelectChangeEvent<string>) => {
        const value = event.target.value;
        setSort(value);
        const newSearchParams = new URLSearchParams(searchParam);
        newSearchParams.set('sort', value);
        setSearchParam(newSearchParams);
    };

    const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
        const newSearchParams = new URLSearchParams(searchParam);
        newSearchParams.set('page', value.toString());
        setSearchParam(newSearchParams);
    };
  return (
    <div className='-z-10 mt-10'>
        <div>
            <h1 className='text-3xl text-center font-bold text-gray-700 pb-5 px-9 uppercase space-x-2'>
                Tên Sản Phẩm
            </h1>
        </div>
        <div className='lg:flex'>
            <section className='filter_section hidden lg:block w-[20%]'>
                <FilterSection />
            </section>
            <div className='w-full lg:w-[80%] space-y-5'>
                <div className='flex justify-between items-center px-9 h-[]'>
                    <div className='relative w-[50%]'>
                        { !isLargeScreen && (<IconButton><FilterAlt/></IconButton>)}    
                        { !isLargeScreen && (<Box><FilterSection/></Box>)}  
                    </div>

                    <FormControl 
                size='small' 
                sx={{
                    width: "240px",
                    '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': {
                            borderColor: '#3f51b5',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#3f51b5',
                        }
                    }
                }}
            >
                <InputLabel 
                    shrink 
                    htmlFor="sort-select"
                    sx={{
                        color: '#3f51b5',
                        '&.Mui-focused': {
                            color: '#3f51b5',
                        }
                    }}
                >
                    Sắp xếp theo
                </InputLabel>
                <Select
                    id="sort-select"
                    value={sort}
                    label="Sắp xếp theo"
                    onChange={handleSortChange}
                    MenuProps={{
                        PaperProps: {
                            sx: {
                                maxHeight: 300,
                                '& .MuiMenuItem-root': {
                                    padding: '12px 16px',
                                    '&:hover': {
                                        backgroundColor: 'rgba(63, 81, 181, 0.08)',
                                    },
                                    '&.Mui-selected': {
                                        backgroundColor: 'rgba(63, 81, 181, 0.16)',
                                        '&:hover': {
                                            backgroundColor: 'rgba(63, 81, 181, 0.24)',
                                        }
                                    }
                                }
                            }
                        }
                    }}
                >
                    {sortOptions.map((option) => (
                        <MenuItem 
                            key={option.value} 
                            value={option.value}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    transform: 'translateX(4px)'
                                }
                            }}
                        >
                            <span style={{ fontSize: '1.2rem' }}>{option.icon}</span>
                            <span>{option.label}</span>
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>


                </div> 
                <Divider/>
                <section className='products_section grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-5 px-5 justify-center'>
                {loading ? (
                    <div>Loading...</div>
                ) : filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))
                ) : (
                    <div>Không tìm thấy sản phẩm nào</div>
                )}
                </section>
            

                    <div className='flex justify-center items-center py-10'>
                        <Pagination
                            count={totalPages}
                            page={Number(searchParam.get('page')) || 1}
                            onChange={handlePageChange}
                            color="primary"
                            shape="rounded"
                            size="large"
                            showFirstButton
                            showLastButton
                            className='flex justify-center'
                            sx={{
                                '& .MuiPaginationItem-root': {
                                    margin: '0 4px',
                                    fontWeight: 600,
                                    color: '#3f51b5',
                                    '&.Mui-selected': {
                                        backgroundColor: '#3f51b5',
                                        color: 'white',
                                        '&:hover': {
                                            backgroundColor: '#303f9f'
                                        }
                                    }
                                }
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Product
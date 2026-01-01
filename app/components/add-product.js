"use client";


import React from 'react';
import BreadCrumb from "@/app/components/bread-crumb";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { title } from 'node:process';
import { request } from 'node:https';

const breadCrumb=[
    {title: "Home", url: "../"},
    {title: "add new product", url: "../add/"},
];

const AddProduct =() =>{
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const router =useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
    // eslint-disable-next-line react-hooks/rules-of-hooks
    } = useForm();

    const onSubmit = async (data)=>{
        try{
            const res =  await fetch("../api", {
                method: "POST",
                body: JSON.stringify(data)
            })
            if (!res.ok)
            {
                throw new Error("Failed to add product");
            }
            const {message} = await res.json();
            alert(message);
            router.push("/");

        }
        catch (error) {
      console.log("Failed to add product", error);
      alert("Failed to add product");
    }
        
    };

    return(
        <div>
        <BreadCrumb lists = {breadCrumb}/>

        <h4 className="mb-2">add new product</h4>
        <div className="mb-2">
            <div className="row">
                <div className="col-md-6">
                    <form onSubmit={handleSubmit(onSubmit)} method="POST">
                        <div className="mb-3">
                            <label htmlFor="title" className="form-label">
                                title
                            </label>
                            <input className="form-controll" {... register("title", {required:true})}/>
                                  {errors?.title && <p>Title is required</p>}

                        </div>
                        <div className="mb-3">
                            <label htmlFor="description" className="form-label">
                                description
                            </label>
                            <textarea className = "form-controll" {...register("description" , {required: true})}></textarea>

                        </div>
                        <div className="mb-3">
                            <label htmlFor="price" className="form-label">
                                price
                            </label>
                            <input className="form-control" {...register("price" , {required:true})}/>
                        </div>
                        <div className='mb-3 text-end'>
                            <input type='submit' className='btn btn-primary'/>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        </div>
    )
}

export default AddProduct;

import { connectMongoDB} from "@/app/libs/mongodb";
import { NextResponse } from "next/server";

import Products from "@/app/models/products";
import { error } from "console";

export async function GET(request, {params}) {
    try {
      const {ID} =await params;
      const id=ID
      console.log("params is ", id);
      await connectMongoDB();
      
      // Use findById instead of findOne for better error handling
      const product = await Products.findById(id);
      
      if (!product) {
        return NextResponse.json(
          { error: "Product not found" }, 
          { status: 404 }
        );
      }
      
      console.log("prod is ", product);
      // Fix: return {product} not {products}
      return NextResponse.json({product}, {status: 200});
    } catch (error) {
      console.error("Error fetching product:", error);
      return NextResponse.json(
        { error: "Failed to fetch product" }, 
        { status: 500 }
      );
    }
  }

export async function POST(request, {params}) {
    const {ID}= await params;
    const id=ID;
    const {title, description, price}=await request.json();
    await connectMongoDB();
    // await Products.findByandUpdate(id, {title, description, price});
    await Products.findByIdAndUpdate(
    id,
    { title, description, price },
    { new: true } // optional
  );
    return NextResponse.json(
        { message: "Product updated successfully" },
    { status: 200 }
    );
    
}

export async function DELETE(request, {params}) {
    try{
        const {ID}=await params;
    const id = ID;
    console.log("DELETE", id);
    await connectMongoDB();
    await Products.findByIdAndDelete(id);
    return NextResponse.json({ message: "Product deleted successfully" },
    { status: 200 });
    }
    catch(error)
    {
        console.error("Error deleting product:", error);
        return NextResponse.json(
          { error: "Failed to delete product" },
          { status: 500 }
        );
  
    }
    
}
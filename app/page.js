"use client";
import React from "react";
import Link from "next/link";
import Allprodect from "./components/all-product";

const Home =() =>{
  return(
    <div>
      <div className="d-flex mb-2">
        <Link className="btn btn-primary" href="../add/">
        add product</Link>

      </div>
      <div>
        <Allprodect/>
      </div>
    </div>
  )
}
export default Home;
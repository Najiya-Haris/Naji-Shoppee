
<%- include('../layouts/adminLayouts/header.ejs') %>

	<%- include('../layouts/adminLayouts/sidebar.ejs') %>

		<%- include('../layouts/adminLayouts/navbar.ejs') %>
<div id="relodDiv">

<div class="container">
  <div class="col-lg-12 grid-margin stretch-card pt-5">
    <div class="card">
      <div class="card-body">
        <h4 class="card-title pt-3">Product List</h4>
        <div class="w-100 d-flex justify-content-end p-2 align-items-center">
       
          <button type="button" class="btn btn-success m-2" data-bs-toggle="modal"
									data-bs-target="#exampleModal" data-bs-whatever="@mdo"> ADD COUPON</button>
        </div>

        <!-- Category inserting modal section -->
				<div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel"
        aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h4 class="modal-title fs-5" id="exampleModalLabel">ADD COUPON</h4>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <form class="forms-sample" method="post" action="/admin/insert-coupen">
                  <div class="form-group row">
                    <label for="code" class="col-sm-4 col-form-label">CODE</label>
                    <div class="col-sm-8">
                      <input type="text" class="form-control" id="code" name="code" required>
                    </div>
                  </div>
                  <div class="form-group row">
                    <label for="discountType" class="col-sm-4 col-form-label">DISCOUNT TYPE</label>
                    <div class="col-sm-8">
                      <input type="text" class="form-control" id="discountType" name="discount" required>
                    </div>
                  </div>
                  <div class="form-group row">
                    <label for="startDate" class="col-sm-4 col-form-label">START DATE</label>
                    <div class="col-sm-8">
                      <input type="date" class="form-control" id="startDate" name="startdate" required>
                    </div>
                  </div>
                  <div class="form-group row">
                    <label for="expiryDate" class="col-sm-4 col-form-label">EXPIRY DATE</label>
                    <div class="col-sm-8">
                      <input type="date" class="form-control" id="expiryDate" name="expirydate" required>
                    </div>
                  </div>
                  <div class="form-group row">
                    <label for="percentage" class="col-sm-4 col-form-label">PERCENTAGE</label>
                    <div class="col-sm-8">
                      <input type="number" class="form-control" id="percentage" name="percentage" required>
                    </div>
                  </div>
                  <div class="form-group">
                    <button type="submit" class="btn btn-primary mr-2">Submit</button>
                    <button class="btn btn-dark" id="Cancel" data-bs-dismiss="modal">Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
      </div>
    
    <div class="row">
      
      <div class="col-12">
        <table class="table table-responsive table-dark">
          <thead>
            <tr>
              <th>Code</th>
              <th>Discount Type</th>
              <th>Start Date</th>
              <th>Expiry Date</th>
              <th>Discount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <% if (coupen.length > 0) {
                coupen.forEach(coupen => {  %>
            <tr>
              <td><%= coupen.code  %></td>
              <td><%= coupen.discountType  %></td>
              <td><%= coupen.startDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }).replace(/\//g,'-')   %></td>
              <td><%= coupen.expiryDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }).replace(/\//g,'-')   %></td>
              <td><%= coupen.discountPercentage  %>%</td>
              <td>
                <a class="btn btn-success" data-bs-toggle="modal" data-bs-target="#editcoupen-<%= coupen._id %>">edit</a>
                <a class="btn btn-danger" onclick="deleteCoupen('<%= coupen._id %>')">delete</a>
              </td>
            </tr>
            
            <!-- Edit Coupon Modal -->
            <div class="modal fade" id="editcoupen-<%= coupen._id %>" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
              <div class="modal-dialog">
                <div class="modal-content">
                  <div class="modal-header">
                    <h4 class="modal-title fs-5" id="exampleModalLabel">EDIT COUPON</h4>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
                    <form class="forms-sample" method="post" action="/admin/update-coupen/<%= coupen._id %>">
                      <div class="form-group row">
                        <label for="edit-code" class="col-sm-4 col-form-label">CODE</label>
                        <div class="col-sm-8">
                          <input type="text" class="form-control" id="edit-code" name="code" value="<%= coupen.code %>" required>
                        </div>
                      </div>
                      <div class="form-group row">
                        <label for="edit-discountType" class="col-sm-4 col-form-label">DISCOUNT TYPE</label>
                        <div class="col-sm-8">
                          <input type="text" class="form-control" id="edit-discountType" name="discount" value="<%= coupen.discountType %>" required>
                        </div>
                      </div>
                      <div class="form-group row">
                        <label for="edit-startDate" class="col-sm-4 col-form-label">START DATE</label>
                        <div class="col-sm-8">
                          <input type="date" class="form-control" id="edit-startDate" name="startdate" value="<%= coupen.startDate.toISOString().split('T')[0] %>" required>
                        </div>
                      </div>
                      <div class="form-group row">
                        <label for="edit-expiryDate" class="col-sm-4 col-form-label">EXPIRY DATE</label>
                        <div class="col-sm-8">
                          <input type="date" class="form-control" id="edit-expiryDate" name="expirydate" value="<%= coupen.expiryDate.toISOString().split('T')[0] %>" required>
                        </div>
                      </div>
                      <div class="form-group row">
                        <label for="edit-percentage" class="col-sm-4 col-form-label">PERCENTAGE</label>
                        <div class="col-sm-8">
                          <input type="number" class="form-control" id="edit-percentage" name="percentage" value="<%= coupen.discountPercentage %>" required>
                        </div>
                      </div>
                      <div class="form-group">
                        <button type="submit" class="btn btn-primary mr-2">Submit</button>
                        <button class="btn btn-dark" id="Cancel" data-bs-dismiss="modal">Cancel</button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
      
  
            <%          
              });     } else {    %> 
            <tr>
              <td colspan="6">
                <h1>No Any Coupon Available</h1>
              </td>
            </tr>
            <% } %> 
          </tbody>
        </table>
      <div class="ec-vendor-list card card-default">
        <div class="card-body">
          
        </div>
        </div>
        </div>
      </div>
      </div>
    </div>
  </div>
</div>

</div>

<script>


  function deleteCoupen(coupenId) {
              Swal.fire({
                  title: 'Are you sure?',
                  text: "You want to delete!",
                  icon: 'warning',
                  showCancelButton: true,
                  confirmButtonColor: '#3085d6',
                  cancelButtonColor: '#d33',
                  confirmButtonText: 'Yes, delete!'
              }).then((result) => {
                  if (result.isConfirmed) {
                      $.ajax({
                        url:'/admin/delete-coupen',
                          method:'post',
                          data:{
                            id:coupenId
                          },
                          success: (response) => {
                              if (response.success) {
                                  location.reload(() => {
                                      Swal.fire({
                                          title: 'Deleted!',
                                          text: 'Your item has been deleted.',
                                          icon: 'success',
                                          timer: 1500,
                                          showConfirmButton: false
                                      });
                                  });
                              } else {
                                  Swal.fire({
                                      title: 'Error!',
                                      text: 'Failed to delete item.',
                                      icon: 'error',
                                      showConfirmButton: false
                                  });
                              }
                          },
                          error: (error) => {
                              console.log(error);
                              Swal.fire({
                                  title: 'Error!',
                                  text: 'An error occurred while deleting the item.',
                                  icon: 'error',
                                  showConfirmButton: false
                              });
                          }
                      });
                  }
              });
          }

</script>

<%- include('../layouts/adminLayouts/footer.ejs') %>
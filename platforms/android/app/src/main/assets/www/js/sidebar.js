window.sideBar = {};

sideBar.changeSideBar = function()
{
  var sidebar = document.getElementById('navSidebar');
  var mainpg =  document.getElementById('mainpage')
  if(this.sidebarCollapse)
  {
    sidebar.style.width = "200px";
    sidebar.style.boxShadow="1px 1px 12px 1px grey";
    mainpg.style.marginLeft = "200px";
    this.sidebarCollapse = false;

  }
  else
  {
    sidebar.style.width = "0";
    sidebar.style.boxShadow="0px 0px 0px 0px grey";
    mainpg.style.marginLeft = "0";
    this.sidebarCollapse = true;
  }
};

sideBar.closeSideBar = function(){
  var sidebar = document.getElementById('navSidebar');
  var mainpg =  document.getElementById('mainpage')
  sidebar.style.width = "0";
  sidebar.style.boxShadow="0px 0px 0px 0px grey";
  mainpg.style.marginLeft = "0";
  this.sidebarCollapse = true;
};

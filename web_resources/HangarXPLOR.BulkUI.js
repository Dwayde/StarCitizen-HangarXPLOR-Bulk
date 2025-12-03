
var HangarXPLOR = HangarXPLOR || {};

var auto_refresh = true;

HangarXPLOR.BulkEnabled = true;

HangarXPLOR._callbacks = HangarXPLOR._callbacks || {};

HangarXPLOR._callbacks.Gift = function (e) {
    e.preventDefault();
    window.Main.closeModal();

    var data = {
        item_price: '$' + HangarXPLOR._selectedMelt.toLocaleString('en-US', { minimumFractionDigits: 2 }),
        item_name: HangarXPLOR._giftable.length + ' Ships',
        items: HangarXPLOR._giftable,
    };

    HangarXPLOR.BulkUI.modal = new RSI.Lightbox({
        content: window.Main.renderTemplate("#tpl_gift_bulk", data),
        class_name: 'modals',
        noclose_btn: true
    });
    
    HangarXPLOR.BulkUI.modal.holder.find(".panes").css({ left: '0px' });

    if(HangarXPLOR._selectedPackages > 0) {
        $('#gift .panes .pane.step1').show();
        $('#gift .panes .pane.step2').hide();
    } else {
        $('#gift .panes .pane.step1').hide();
        $('#gift .panes .pane.step2').show();
    }

    $(document).on('submit', 'form[name=gift-bulk]', HangarXPLOR._callbacks.GiftConfirm);

    HangarXPLOR.BulkUI.modal.fadeIn(300);
}

HangarXPLOR._callbacks.GiftConfirm = function (e) {

    //alert("Coming soon...")
    //return;

     e.preventDefault();
     var totalCallbacks = HangarXPLOR._selected.length;
     var totalSuccess = 0;
     var totalError = 0;
     //var gifted = '';
     //var errors = '';
     let errors = document.createElement("ul");
     let gifted = document.createElement("ul");
 
     $('#gift .panes').hide();
     $('#gift form[name=gift-bulk]').css({'overflow':'auto', "max-height":"500px"});

     $('#reclaim .js-error-message').empty();
     $('#reclaim .js-error-message').hide();
     $('#reclaim .js-success-message').empty();
     $('#reclaim .js-success-message').hide();
     $('#gift .js-error-message').empty();
     $('#gift .js-error-message').hide();
     $('#gift .js-success-message').empty();
     $('#gift .js-success-message').hide();

     giftNext();

     function giftNext() {
        var pledge = HangarXPLOR._selected[totalCallbacks - 1];

        try {
            $.ajax({
                url: '/api/account/giftPledge',
                method: 'POST',
                data: {
                    current_password: $('input[name=current_password]', HangarXPLOR.BulkUI.modal.holder).val(),
                    email: $('input[name=gift_email]', HangarXPLOR.BulkUI.modal.holder).val(),
                    name: $('input[name=gift_name]', HangarXPLOR.BulkUI.modal.holder).val(),
                    pledge_id: pledge.pledge_id
                },
                headers: { 'X-Rsi-Token': $.cookie('Rsi-Token') },
                error: function(data) {
                    if (--totalCallbacks > 0) {
                        setTimeout(function () { giftNext(); }, 3000);
                    }
                },
                success: function (result) {
                    if (!result.success) {
                        totalError++;
                        let msg = document.createElement('li');
                        if(result.msg.includes("<strong>")) {
                            let errormsg = document.createElement('strong');
                            var subString = result.msg.substring(
                                result.msg.indexOf("<strong>") + 8, 
                                result.msg.indexOf("</strong>")
                              );
                            errormsg.textContent = subString;
                            msg.textContent = pledge.pledge_name + ' - ' + 
                              result.msg.substring(
                                0, 
                                result.msg.indexOf("<strong>")
                              ) + " ";
                            msg.append(errormsg);
                            msg.textContent += result.msg.substring(
                                result.msg.indexOf("</strong>") + 9, 
                                result.msg.length
                              );
                            errors.append(errormsg);
                        } else {
                            msg.textContent = pledge.pledge_name + ' - ' + result.msg;
                        }
                        errors.append(msg);
                        //errors += '<li>' + pledge.pledge_name + ' - ' + result.msg + '</li>';
                        console.log(`Failed to gift ${pledge.pledge_name} (${pledge.pledge_id}) for the following reason: \n%c${result.msg}`, "color:red; font-size:16px");     
                    } else {
                        totalSuccess++;
                        
                        console.log(`Succesfull gifted ${pledge.pledge_name}. %c!`, "color:green; font-size:16px");
                        let msg = document.createElement('li');
                        msg.textContent = pledge.pledge_name;
                        gifted.append(msg);
                        //gifted += '<li>' + pledge.pledge_name + '</li>';
                    }
    
                    if (--totalCallbacks > 0) {
                        setTimeout(function () { giftNext(); }, 3000);
                    } else {
                        if(totalSuccess > 0) {
                            auto_refresh = document.getElementById('auto_refresh_gift').checked;
                            if(auto_refresh || auto_refresh == "true" || auto_refresh == 1 || auto_refresh == "1") {
                                setTimeout(function () {
                                    document.location.reload();
                                }, 3000);
                            } else {
                                setTimeout(function () { 
                                    if (confirm("Refresh page now?") == true) {
                                        setTimeout(function () {
                                            document.location.reload();
                                        }, 3000);
                                    } else {
                                        setTimeout(function () {
                                            if (confirm("Refresh page now? (Don't forget after gifting its required for hangar reloading)") == true) {
                                                document.location.reload();
                                            } else {
                                                 setTimeout(function () { 
                                                    if (confirm("Refresh page now? (Page will be auto-refreshed in 60 seconds if cancel now)") == true) {
                                                        document.location.reload();
                                                    } else {
                                                        setTimeout(function () {
                                                            document.location.reload();
                                                        }, 60000);
                                                    }
                                                 }, 10000);
                                            }
                                         }, 10000);
                                    }
                                }, 5000);
                            }
                        }
                    }
                    
                    if (totalSuccess > 0) {
                        //$('#gift .js-success-message').html('');
                        $('#gift .js-success-message').empty();
                        let txt = document.createElement("div");
                        txt.textContent = "Your gifted ";
                        let strong = document.createElement("strong");
                        strong.textContent = totalSuccess;
                        txt.append(strong);
                        txt.textContent += " items!";
                        txt.append(gifted);
                        $('#gift .js-success-message').append(txt).fadeIn(300);
                        //$('#gift .js-success-message').html("Your gifted <strong>" + totalSuccess + "</strong> items!" + '<ul>' + gifted + '</ul>').fadeIn(300);
                    } else {
                        $('#gift .js-success-message').empty();
                        $('#gift .js-success-message').hide();
                    }
    
                    if (totalError > 0) {
                        //$('#gift .js-error-message').html('');
                        $('#gift .js-error-message').empty();
                        let txt = document.createElement("div");
                        txt.textContent = 'There were errors completing your request.';
                        txt.append(errors);
                        $('#gift .js-error-message').append(txt);
                        //$('#gift .js-error-message').html('There were errors completing your request. <ul>' + errors + '</ul>').fadeIn(300);
                        $('#gift .js-error-message').fadeIn(300);
                    } else {
                        $('#gift .js-error-message').empty();
                        $('#gift .js-error-message').hide();
                    }
    
                    HangarXPLOR.BulkUI.modal.resizeCurrent();
                }
            }).fail(function (data) {
                if (--totalCallbacks > 0) {
                    setTimeout(function () { giftNext(); }, 3000);
                }
            });
        } catch (e) {
            if (--totalCallbacks > 0) {
                setTimeout(function () { giftNext(); }, 3000);
            }
        }

        
     }
}

function confirm_alert(type) {

    if(type == "GIFT") {
        $('#gift .panes .pane.step1').fadeOut(300);
        $('#gift .panes .pane.step2').fadeIn(300);
    }
    
    if(type == "RECLAIM") {
        $('#reclaim .panes .pane.step1').fadeOut(300);
        $('#reclaim .panes .pane.step2').fadeIn(300);
    }
}
HangarXPLOR._callbacks.Melt = function (e) {
    e.preventDefault();
    window.Main.closeModal();

    var data = {
        item_price: '$' + HangarXPLOR._selectedMelt.toLocaleString('en-US', { minimumFractionDigits: 2 }),
        item_name: HangarXPLOR._meltable.length + ' Ships',
        items: HangarXPLOR._meltable,
    };

    HangarXPLOR.BulkUI.modal = new RSI.Lightbox({
        content: window.Main.renderTemplate("#tpl_reclaim_bulk", data),
        class_name: 'modals',
        noclose_btn: true
    });

    HangarXPLOR.BulkUI.modal.holder.find(".panes").css({ left: '0px' });

    if(HangarXPLOR._selectedPackages > 0) {
        $('#reclaim .panes .pane.step1').show();
        $('#reclaim .panes .pane.step2').hide();
    } else {
        $('#reclaim .panes .pane.step1').hide();
        $('#reclaim .panes .pane.step2').show();
    }


    $(document).on('submit', 'form[name=reclaim-bulk]', HangarXPLOR._callbacks.MeltConfirm);

    HangarXPLOR.BulkUI.modal.fadeIn(300);
}

HangarXPLOR._callbacks.MeltConfirm = function (e) {
    e.preventDefault();
    var totalCallbacks = HangarXPLOR._selected.length;
    var totalSuccess = 0;
    var totalError = 0;
    var totalMelt = 0;
    //var melted = '';
    //var errors = '';
    let errors = document.createElement("ul");
    let melted = document.createElement("ul");

    $('#reclaim .panes').hide();
    $('#reclaim form[name=reclaim-bulk]').css({'overflow':'auto', "max-height":"500px"});

    $('#reclaim .js-error-message').empty();
    $('#reclaim .js-error-message').hide();
    $('#reclaim .js-success-message').empty();
    $('#reclaim .js-success-message').hide();
    $('#gift .js-error-message').empty();
    $('#gift .js-error-message').hide();
    $('#gift .js-success-message').empty();
    $('#gift .js-success-message').hide();


    meltNext();

    function meltNext() {
        var pledge = HangarXPLOR._selected[totalCallbacks - 1];
        
        try {
            $.ajax({
                url: '/api/account/reclaimPledge',
                method: 'POST',
                data: {
                    current_password: $('input[name=current_password]', HangarXPLOR.BulkUI.modal.holder).val(),
                    pledge_id: pledge.pledge_id
                },
                headers: { 'X-Rsi-Token': $.cookie('Rsi-Token') },
                error: function(data) {
                    if (--totalCallbacks > 0) {
                        setTimeout(function () { meltNext(); }, 3000);
                    }
                },
                success: function (result) {
                    if (!result.success) {
                        totalError++;
                        //errors += '<li>' + pledge.pledge_name + ' - ' + result.msg + '</li>';
                        let msg = document.createElement('li');
                        if(result.msg.includes("<strong>")) {
                            let errormsg = document.createElement('strong');
                            var subString = result.msg.substring(
                                result.msg.indexOf("<strong>") + 8, 
                                result.msg.indexOf("</strong>")
                            );
                            errormsg.textContent = subString;
                            msg.textContent = pledge.pledge_name + ' - ' + 
                            result.msg.substring(
                                0, 
                                result.msg.indexOf("<strong>")
                            ) + " ";
                            msg.append(errormsg);
                            msg.textContent += result.msg.substring(
                                result.msg.indexOf("</strong>") + 9, 
                                result.msg.length
                            );
                            errors.append(errormsg);
                        } else {
                            msg.textContent = pledge.pledge_name + ' - ' + result.msg;
                        }
                        errors.append(msg);
                        console.log(`Failed to melt ${pledge.pledge_name} (${pledge.pledge_id}) for the following reason: \n%c${result.msg}`, "color:red; font-size:16px");     
                    } else {
                        totalSuccess++;
                        totalMelt += pledge.melt_value;
                        
                        console.log(`Succesfull melted ${pledge.pledge_name}. %c Added ${pledge.melt_value}$ to your ledger!`, "color:green; font-size:16px");
                        let msg = document.createElement('li');
                        msg.textContent = pledge.pledge_name + ' - ' + pledge.melt_value + '$';
                        melted.append(msg);
                        //melted += '<li>' + pledge.pledge_name + ' - ' + pledge.melt_value + '$</li>';
                    }

                    if (--totalCallbacks > 0) {
                        setTimeout(function () { meltNext(); }, 3000);
                    } else {
                        if(totalSuccess > 0) {
                            auto_refresh = document.getElementById('auto_refresh_reclaim').checked;
                            if(auto_refresh || auto_refresh == "true" || auto_refresh == 1 || auto_refresh == "1") {
                                setTimeout(function () {
                                    document.location.reload();
                                }, 3000);
                            } else {
                                setTimeout(function () { 
                                    if (confirm("Refresh page now?") == true) {
                                        setTimeout(function () {
                                            document.location.reload();
                                        }, 3000);
                                    } else {
                                        setTimeout(function () {
                                            if (confirm("Refresh page now? (Don't forget after melting its required for hangar reloading)") == true) {
                                                document.location.reload();
                                            } else {
                                                setTimeout(function () { 
                                                    if (confirm("Refresh page now? (Page will be auto-refreshed in 60 seconds if cancel now)") == true) {
                                                        document.location.reload();
                                                    } else {
                                                        setTimeout(function () {
                                                            document.location.reload();
                                                        }, 60000);
                                                    }
                                                }, 10000);
                                            }
                                        }, 10000);
                                    }
                                }, 5000);
                            }
                        }
                    }       

                    
                    if (totalSuccess > 0) {
                        //$('#reclaim .js-success-message').html('');
                        $('#reclaim .js-success-message').empty();
                        let txt = document.createElement("div");
                        txt.textContent = "Your Store ledger was credited with ";
                        let strong = document.createElement("strong");
                        strong.textContent = totalMelt.toLocaleString('en-US', { minimumFractionDigits: 2 }) + "$";
                        txt.append(strong);
                        txt.append(melted);
                        $('#reclaim .js-success-message').append(txt).fadeIn(300);
                        //$('#reclaim .js-success-message').html("Your Store ledger was credited with <strong>" + totalMelt.toLocaleString('en-US', { minimumFractionDigits: 2 }) + "$</strong>" + '<ul>' + melted + '</ul>').fadeIn(300);
                    } else {
                        $('#reclaim .js-success-message').empty();
                        $('#reclaim .js-success-message').hide();
                    }

                    if (totalError > 0) {
                        //$('#reclaim .js-error-message').html('');
                        $('#reclaim .js-error-message').empty();
                        let txt = document.createElement("div");
                        txt.textContent = 'There were errors completing your request.';
                        txt.append(errors);
                        $('#reclaim .js-error-message').append(txt).fadeIn(300);
                        //$('#reclaim .js-error-message').html('There were errors completing your request. <ul>' + errors + '</ul>').fadeIn(300);
                    } else {
                        $('#reclaim .js-error-message').empty();
                        $('#reclaim .js-error-message').hide();
                    }

                    HangarXPLOR.BulkUI.modal.resizeCurrent();
                }
            }).fail(function (data) {
                if (--totalCallbacks > 0) {
                    setTimeout(function () { meltNext(); }, 3000);
                }
            });
        } catch (e) {
            if (--totalCallbacks > 0) {
                setTimeout(function () { meltNext(); }, 3000);
            }
        }
    }
}

